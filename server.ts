import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dns from "dns/promises";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to check if an IP is private/reserved
  const isPrivateIP = (ip: string) => {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4) return false;
    
    return (
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 127 ||
      parts[0] === 0 ||
      parts[0] === 169 // 169.254.x.x
    );
  };

  // Helper to check if string is an IPv4
  const isIPv4 = (ip: string) => {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
  };

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/scan", async (req, res) => {
    let { target } = req.body;
    
    if (!target) {
      return res.status(400).json({ error: true, message: "Target is required" });
    }

    target = target.trim();
    let ipToScan = target;

    // Resolve domain to IP if not already an IP
    if (!isIPv4(target)) {
      try {
        const lookupResult = await dns.lookup(target);
        ipToScan = lookupResult.address;
      } catch (err) {
        return res.status(400).json({ error: true, message: "Invalid domain or lookup failed", target });
      }
    }

    // Check for private IP
    if (isPrivateIP(ipToScan)) {
      return res.status(200).json({ 
        error: true, 
        message: "Local Network / Private IP (Geolocation Unavailable)",
        ip: ipToScan,
        target 
      });
    }

    try {
      // Use ipapi.co as it has excellent ISP & ASN data, fallback to ipwho.is if needed
      const response = await fetch(`https://ipapi.co/${ipToScan}/json/`);
      const data = await response.json();
      
      if (data && !data.error && data.ip) {
        // Extract domain from org name if possible
        const orgName = data.org || data.isp || 'unknown';
        const mockDomain = orgName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.net';
        
        return res.json({
          success: true,
          ip: data.ip,
          target: target,
          city: data.city,
          region: data.region,
          country: data.country_name,
          country_code: data.country,
          latitude: data.latitude,
          longitude: data.longitude,
          connection: {
            isp: data.org || data.isp || 'Unknown',
            asn: data.asn ? data.asn.replace('AS', '') : 'Unknown',
            org: data.org || 'Unknown',
            domain: mockDomain
          }
        });
      } else {
        // Fallback to ipwho.is if rate limited
        const fbResponse = await fetch(`https://ipwho.is/${ipToScan}`);
        const fbData = await fbResponse.json();
        
        if (fbData.success) {
          return res.json({
            success: true,
            ip: fbData.ip,
            target: target,
            city: fbData.city,
            region: fbData.region,
            country: fbData.country,
            country_code: fbData.country_code,
            latitude: fbData.latitude,
            longitude: fbData.longitude,
            connection: {
              isp: fbData.connection?.isp || 'Unknown',
              asn: fbData.connection?.asn ? String(fbData.connection.asn).replace('AS', '') : 'Unknown',
              org: fbData.connection?.org || 'Unknown',
              domain: fbData.connection?.domain || 'unknown.net'
            }
          });
        } else {
          return res.status(400).json({ error: true, message: "Lookup failed", ip: ipToScan, target });
        }
      }
    } catch (err) {
      console.error('Scan Error:', err);
      return res.status(500).json({ error: true, message: "Internal server error during scan", ip: ipToScan, target });
    }
  });

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
