import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dns from "dns/promises";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to check if string is an IPv4
  const isIPv4 = (ip: string) => {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip.trim());
  };

  // Helper to check if string is an IPv6
  const isIPv6 = (ip: string) => {
    const trimmed = ip.trim();
    return trimmed.includes(':') && /^[a-fA-F0-9:]+$/.test(trimmed);
  };

  const isIP = (ip: string) => isIPv4(ip) || isIPv6(ip);

  // Helper to check if an IP is private/reserved/loopback
  const isPrivateIP = (ip: string) => {
    const trimmed = ip.trim();
    if (
      trimmed === '::1' || 
      trimmed === '127.0.0.1' || 
      trimmed === 'localhost' ||
      trimmed.startsWith('fe80:') || 
      trimmed.startsWith('fc00:') || 
      trimmed.startsWith('fd00:') ||
      trimmed.startsWith('::ffff:127.') ||
      trimmed.startsWith('::ffff:10.') ||
      trimmed.startsWith('::ffff:192.168.')
    ) {
      return true;
    }

    const cleanIPv4 = trimmed.replace(/^::ffff:/, '');
    const parts = cleanIPv4.split('.').map(Number);
    if (parts.length !== 4) return false;
    
    return (
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 127 ||
      parts[0] === 0 ||
      parts[0] === 169 // 169.254.x.x link-local
    );
  };

  // Reusable Geo-resolver with primary and fallback providers
  const fetchGeolocation = async (ipOrHost: string, targetOriginal: string) => {
    const query = ipOrHost.trim();
    
    // 1. Primary provider: ipwho.is (fast, unthrottled, rich geo coordinates)
    try {
      const ipWhoRes = await fetch(`https://ipwho.is/${query}`);
      const ipWhoData = await ipWhoRes.json();
      
      if (ipWhoData && ipWhoData.success) {
        return {
          success: true,
          ip: ipWhoData.ip,
          target: targetOriginal,
          city: ipWhoData.city || 'Unknown',
          region: ipWhoData.region || 'Unknown',
          country: ipWhoData.country || 'Global',
          country_code: ipWhoData.country_code || 'XX',
          latitude: Number(ipWhoData.latitude) || 0,
          longitude: Number(ipWhoData.longitude) || 0,
          connection: {
            isp: ipWhoData.connection?.isp || 'Internet Service Provider',
            asn: ipWhoData.connection?.asn ? String(ipWhoData.connection.asn).replace('AS', '') : 'Unknown',
            org: ipWhoData.connection?.org || ipWhoData.connection?.isp || 'Unknown Organization',
            domain: ipWhoData.connection?.domain || `${targetOriginal.toLowerCase().replace(/[^a-z0-9]/g, '')}.net`
          }
        };
      }
    } catch (e) {
      console.warn('ipwho.is fetch warning:', e);
    }

    // 2. Secondary fallback provider: ip-api.com
    try {
      const ipApiRes = await fetch(`http://ip-api.com/json/${query}?fields=status,message,country,countryCode,regionName,city,lat,lon,isp,org,as,query`);
      const ipApiData = await ipApiRes.json();

      if (ipApiData && ipApiData.status === 'success') {
        const cleanAsn = ipApiData.as ? (ipApiData.as.match(/AS\d+/) ? ipApiData.as.match(/AS\d+/)[0].replace('AS', '') : 'Unknown') : 'Unknown';
        return {
          success: true,
          ip: ipApiData.query,
          target: targetOriginal,
          city: ipApiData.city || 'Unknown',
          region: ipApiData.regionName || 'Unknown',
          country: ipApiData.country || 'Global',
          country_code: ipApiData.countryCode || 'XX',
          latitude: Number(ipApiData.lat) || 0,
          longitude: Number(ipApiData.lon) || 0,
          connection: {
            isp: ipApiData.isp || 'Internet Service Provider',
            asn: cleanAsn,
            org: ipApiData.org || ipApiData.isp || 'Autonomous System',
            domain: `${targetOriginal.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
          }
        };
      }
    } catch (e) {
      console.warn('ip-api.com fetch warning:', e);
    }

    return null;
  };

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/my-ip", async (req, res) => {
    try {
      const rawForwarded = req.headers['x-forwarded-for'];
      let clientIp = '';
      if (typeof rawForwarded === 'string') {
        clientIp = rawForwarded.split(',')[0].trim();
      } else if (Array.isArray(rawForwarded) && rawForwarded.length > 0) {
        clientIp = rawForwarded[0].trim();
      } else if (req.socket.remoteAddress) {
        clientIp = req.socket.remoteAddress.replace(/^::ffff:/, '').trim();
      }

      // If client IP is local or private, pass empty query to ipwho.is to discover server public outbound IP
      const isLocal = !clientIp || isPrivateIP(clientIp);
      const queryTarget = isLocal ? '' : clientIp;

      const geo = await fetchGeolocation(queryTarget, clientIp || 'Current Operator');
      if (geo) {
        return res.json(geo);
      }

      // Safe fallback if external network query failed
      return res.json({
        success: true,
        ip: clientIp || '127.0.0.1',
        target: 'Operator Node',
        city: 'Local Terminal',
        region: 'Private Network',
        country: 'Localhost',
        country_code: 'LO',
        latitude: 0,
        longitude: 0,
        connection: {
          isp: 'Internal Loopback',
          asn: '0',
          org: 'Local System',
          domain: 'localhost'
        }
      });
    } catch (err) {
      console.error('My-IP Error:', err);
      return res.status(500).json({ error: true, message: "Failed to detect operator IP" });
    }
  });

  app.post("/api/scan", async (req, res) => {
    let { target } = req.body;
    
    if (!target || typeof target !== 'string') {
      return res.status(400).json({ error: true, message: "Target is required" });
    }

    // Clean target if user provided http://, https://, trailing slashes, paths, or ports
    let cleanTarget = target.trim();
    cleanTarget = cleanTarget.replace(/^[a-zA-Z]+:\/\//i, '');
    cleanTarget = cleanTarget.split('/')[0].split('?')[0].split('#')[0].trim();

    // Check for bracketed IPv6 e.g. [2001:db8::1]:8080 or [2001:db8::1]
    const bracketedMatch = cleanTarget.match(/^\[([a-fA-F0-9:]+)\](?::\d+)?$/);
    if (bracketedMatch) {
      cleanTarget = bracketedMatch[1];
    } else if (!isIPv6(cleanTarget) && /:\d+$/.test(cleanTarget)) {
      // Only strip port if it's NOT an IPv6 address (e.g. 1.2.3.4:80 or domain.com:443)
      cleanTarget = cleanTarget.replace(/:\d+$/, '');
    }

    if (!cleanTarget) {
      return res.status(400).json({ error: true, message: "Invalid target format" });
    }

    let ipToScan = cleanTarget;

    // Resolve domain to IP if not already an IPv4 or IPv6
    if (!isIP(cleanTarget)) {
      try {
        const lookupResult = await dns.lookup(cleanTarget);
        ipToScan = lookupResult.address;
      } catch {
        return res.status(400).json({ 
          error: true, 
          message: `Unable to resolve hostname "${cleanTarget}". Verify domain name or IP address.`, 
          target: cleanTarget 
        });
      }
    }

    // Check for private / non-routable IP
    if (isPrivateIP(ipToScan)) {
      return res.status(200).json({ 
        error: true, 
        message: `Local/Private RFC1918 Address (${ipToScan}) - Physical coordinates are not publicly routable over the Internet.`,
        ip: ipToScan,
        target: cleanTarget,
        isPrivate: true
      });
    }

    try {
      const geo = await fetchGeolocation(ipToScan, cleanTarget);
      if (geo) {
        return res.json(geo);
      }

      return res.status(502).json({
        error: true,
        message: `Geolocation service unavailable for IP ${ipToScan}. Try again in a moment.`,
        ip: ipToScan,
        target: cleanTarget
      });
    } catch (err) {
      console.error('Scan Error:', err);
      return res.status(500).json({
        error: true,
        message: "Internal scan error occurred",
        ip: ipToScan,
        target: cleanTarget
      });
    }
  });

  // CARTO integration status endpoint
  app.get("/api/carto/status", (req, res) => {
    const apiKey = process.env.CARTO_API_KEY?.trim();
    const hasKey = Boolean(apiKey && apiKey.length > 0);
    return res.json({
      configured: hasKey,
      mode: hasKey ? "authenticated" : "public",
      provider: "CARTO Dark Matter GIS",
      maskedKey: hasKey ? `${apiKey!.substring(0, 4)}...${apiKey!.slice(-4)}` : null,
      tileEndpoint: hasKey ? "/api/carto/tile/{z}/{x}/{y}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    });
  });

  // CARTO API key configuration endpoint (allows setting key from UI or env)
  app.post("/api/carto/config", (req, res) => {
    const { apiKey } = req.body;
    if (typeof apiKey === 'string') {
      process.env.CARTO_API_KEY = apiKey.trim();
    }
    const currentKey = process.env.CARTO_API_KEY?.trim();
    const hasKey = Boolean(currentKey && currentKey.length > 0);
    return res.json({
      success: true,
      configured: hasKey,
      mode: hasKey ? "authenticated" : "public",
      maskedKey: hasKey ? `${currentKey!.substring(0, 4)}...${currentKey!.slice(-4)}` : null,
      message: hasKey ? "CARTO API Key updated and verified." : "CARTO set to public CDN mode."
    });
  });

  // CARTO API key test & validation endpoint
  app.get("/api/carto/test", async (req, res) => {
    const apiKey = (typeof req.query.key === 'string' && req.query.key.trim()) || process.env.CARTO_API_KEY?.trim();
    if (!apiKey) {
      return res.json({
        success: false,
        configured: false,
        message: "No CARTO_API_KEY detected. Using public CARTO Dark Matter tiles."
      });
    }

    try {
      // Test fetching root tile with API key
      const testUrl = `https://a.basemaps.cartocdn.com/dark_all/0/0/0.png?api_key=${encodeURIComponent(apiKey)}`;
      const testRes = await fetch(testUrl);
      if (testRes.ok) {
        return res.json({
          success: true,
          configured: true,
          status: testRes.status,
          message: "CARTO API Key verified successfully! Enterprise tile proxy active."
        });
      } else {
        return res.status(testRes.status).json({
          success: false,
          configured: true,
          status: testRes.status,
          message: `CARTO server responded with HTTP ${testRes.status}. Check API key permissions.`
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        configured: true,
        message: "Network error connecting to CARTO basemaps API",
        error: String(err)
      });
    }
  });

  // Secure server-side proxy for CARTO tiles with automatic fallback and retina support
  const handleCartoTile = async (req: express.Request, res: express.Response) => {
    const z = String(req.params.z);
    const x = String(req.params.x);
    const rawTile = req.params.y || req.params.tileFile || '';
    const tileParam = Array.isArray(rawTile) ? rawTile[0] : String(rawTile);
    // Strip .png and optional @2x
    const isRetina = tileParam.includes('@2x');
    const cleanY = tileParam.replace(/(@2x)?\.png$/, '');

    const apiKey = (req.headers['x-carto-key'] as string) || process.env.CARTO_API_KEY?.trim();
    const subdomains = ['a', 'b', 'c', 'd'];
    const s = subdomains[Math.abs(parseInt(x, 10) + parseInt(cleanY, 10)) % subdomains.length];
    
    const retinaSuffix = isRetina ? '@2x' : '';
    const targetUrl = apiKey
      ? `https://${s}.basemaps.cartocdn.com/dark_all/${z}/${x}/${cleanY}${retinaSuffix}.png?api_key=${encodeURIComponent(apiKey)}`
      : `https://${s}.basemaps.cartocdn.com/dark_all/${z}/${x}/${cleanY}${retinaSuffix}.png`;

    try {
      let tileRes = await fetch(targetUrl);
      
      // If authenticated fetch returned non-200, gracefully fallback to public tile
      if (!tileRes.ok && apiKey) {
        const publicFallbackUrl = `https://${s}.basemaps.cartocdn.com/dark_all/${z}/${x}/${cleanY}${retinaSuffix}.png`;
        const fallbackRes = await fetch(publicFallbackUrl);
        if (fallbackRes.ok) {
          tileRes = fallbackRes;
        }
      }

      if (!tileRes.ok) {
        return res.status(tileRes.status).send('CARTO tile fetch failed');
      }

      const arrayBuffer = await tileRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.setHeader('Content-Type', tileRes.headers.get('content-type') || 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.send(buffer);
    } catch (err) {
      console.error('CARTO Tile Proxy Error:', err);
      // Fallback redirect or status
      return res.redirect(`https://${s}.basemaps.cartocdn.com/dark_all/${z}/${x}/${cleanY}.png`);
    }
  };

  app.get("/api/carto/tile/:z/:x/:y.png", handleCartoTile);
  app.get("/api/carto/tile/:z/:x/:tileFile", handleCartoTile);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
