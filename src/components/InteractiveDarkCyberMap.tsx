import React, { useState, useRef, useEffect, useCallback } from 'react';
import L from 'leaflet';

export interface InteractiveDarkCyberMapProps {
  latitude: number;
  longitude: number;
  ip?: string;
  target?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  isp?: string;
  asn?: string;
  title?: string;
  className?: string;
}

export const InteractiveDarkCyberMap: React.FC<InteractiveDarkCyberMapProps> = ({
  latitude,
  longitude,
  ip = "127.0.0.1",
  target,
  city = "Unknown",
  region = "Unknown",
  country = "Global",
  countryCode = "XX",
  isp = "Network Carrier",
  asn = "Unknown",
  title = "TARGET GEOSPATIAL RADAR LOCK",
  className = ""
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [cartoConfig, setCartoConfig] = useState<{ configured: boolean; mode: string; maskedKey?: string } | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(7);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Check CARTO API status from server
  useEffect(() => {
    fetch('/api/carto/status')
      .then(r => r.json())
      .then(data => {
        setCartoConfig(data);
        if (tileLayerRef.current) {
          const newUrl = data?.configured
            ? '/api/carto/tile/{z}/{x}/{y}.png'
            : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
          tileLayerRef.current.setUrl(newUrl);
        }
      })
      .catch(() => {});
  }, []);

  // Validate coordinates
  const validLat = Number.isFinite(latitude) && latitude !== 0 ? Math.max(-85, Math.min(85, latitude)) : latitude || 0;
  const validLon = Number.isFinite(longitude) && longitude !== 0 ? Math.max(-180, Math.min(180, longitude)) : longitude || 0;
  const hasValidCoords = Number.isFinite(validLat) && Number.isFinite(validLon) && !(validLat === 0 && validLon === 0);

  // Format coordinates helper
  const formatCoord = (lat: number, lon: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
  };

  const copyCoordinates = () => {
    const coordStr = `${validLat.toFixed(5)}, ${validLon.toFixed(5)}`;
    navigator.clipboard?.writeText(coordStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const centerOnTarget = useCallback(() => {
    if (mapInstanceRef.current && hasValidCoords) {
      mapInstanceRef.current.flyTo([validLat, validLon], 8, {
        duration: 1.2
      });
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  }, [validLat, validLon, hasValidCoords]);

  const viewWorldOverview = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([validLat || 20, validLon || 0], 2, {
        duration: 1.0
      });
    }
  };

  // Initialize Leaflet map with full resilience and auto-resizing
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if container changed
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialZoom = hasValidCoords ? 7 : 2;
    const initialCenter: [number, number] = hasValidCoords ? [validLat, validLon] : [20, 0];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: true,
      maxZoom: 18,
      minZoom: 2,
      worldCopyJump: true
    });

    // CartoDB Dark Matter tile layer: true dark cyber tiles with high-contrast borders and streets
    // Uses authenticated server proxy if CARTO_API_KEY is configured, or direct CARTO basemaps CDN
    const tileUrl = cartoConfig?.configured
      ? '/api/carto/tile/{z}/{x}/{y}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OSM</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      crossOrigin: true
    });

    // Fallback if local tile proxy has any issue
    tileLayer.on('tileerror', () => {
      if (tileLayerRef.current && tileUrl.startsWith('/api/carto/tile')) {
        tileLayerRef.current.setUrl('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');
      }
    });

    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Zoom controls at top right
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Track mouse coordinates
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
    });

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    mapInstanceRef.current = map;

    // Robust multi-stage size invalidation so tiles load during animations & layout reflows
    const timers = [
      setTimeout(() => map.invalidateSize(), 50),
      setTimeout(() => map.invalidateSize(), 200),
      setTimeout(() => map.invalidateSize(), 500),
      setTimeout(() => map.invalidateSize(), 1000)
    ];

    // ResizeObserver ensures map recalibrates instantly on container size change
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      timers.forEach(t => clearTimeout(t));
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update target marker when coordinates or IP details change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (!hasValidCoords) return;

    // Create high-tech radar pulsing icon
    const cyberIcon = L.divIcon({
      className: 'cyber-leaflet-marker',
      html: `
        <div class="cyber-radar-ping">
          <div class="radar-wave wave-1"></div>
          <div class="radar-wave wave-2"></div>
          <div class="radar-crosshair"></div>
          <div class="radar-core"></div>
        </div>
      `,
      iconSize: [60, 60],
      iconAnchor: [30, 30],
      popupAnchor: [0, -30]
    });

    const marker = L.marker([validLat, validLon], { icon: cyberIcon });

    const popupHtml = `
      <div style="padding: 10px 14px; min-width: 220px;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,255,102,0.3); padding-bottom: 6px; margin-bottom: 8px;">
          <span style="color: #00ff66; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
            [RADAR LOCK ACTIVE]
          </span>
          <span style="background: rgba(0,255,102,0.15); color: #00ff66; padding: 1px 5px; font-size: 10px; border-radius: 2px;">
            ${countryCode}
          </span>
        </div>
        <div style="font-size: 13px; font-weight: bold; color: #ffffff; margin-bottom: 4px;">
          ${ip}
        </div>
        ${target && target !== ip ? `<div style="font-size: 11px; color: #00d8ff; margin-bottom: 4px;">Target Host: ${target}</div>` : ''}
        <div style="font-size: 12px; color: #a0aec0; margin-bottom: 6px;">
          <i class="fa-solid fa-location-dot" style="color: #00d8ff; margin-right: 4px;"></i>
          ${city}${region && region !== city ? `, ${region}` : ''}, ${country}
        </div>
        <div style="font-size: 11px; color: #718096; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px; margin-top: 6px;">
          <div><strong style="color: #cbd5e0;">Coordinates:</strong> ${validLat.toFixed(4)}, ${validLon.toFixed(4)}</div>
          ${asn && asn !== 'Unknown' ? `<div><strong style="color: #cbd5e0;">ASN:</strong> AS${asn}</div>` : ''}
          ${isp && isp !== 'Internet Service Provider' ? `<div><strong style="color: #cbd5e0;">Carrier:</strong> ${isp}</div>` : ''}
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, {
      className: 'cyber-popup',
      autoClose: false,
      closeOnClick: false
    });

    marker.addTo(map);
    markerRef.current = marker;

    // Smoothly fly to target and open popup
    map.flyTo([validLat, validLon], 8, { duration: 1.0 });
    marker.openPopup();
  }, [validLat, validLon, ip, target, city, region, country, countryCode, isp, asn, hasValidCoords]);

  // Handle resizing on fullscreen toggle
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }
  }, [isFullscreen]);

  return (
    <div className={`cyber-map-wrapper position-relative ${className} ${isFullscreen ? 'fixed-top w-100 h-100 bg-dark p-3 z-3' : ''}`}>
      {/* Tactical HUD Header */}
      <div className="d-flex justify-content-between align-items-center bg-black bg-opacity-75 border-bottom border-success px-3 py-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="badge bg-success text-black font-monospace fw-bold px-2 py-1">
            <i className="fa-solid fa-satellite-dish me-1"></i>
            GEOLOCK ACTIVE
          </span>
          <span className="text-success small font-monospace fw-bold tracking-wider">
            {title}
          </span>
          <span className="text-secondary small font-monospace">
            // IP: <span className="text-white fw-bold">{ip}</span>
            {target && target !== ip && <span className="text-info ms-1">({target})</span>}
          </span>
          {city && (
            <span className="badge bg-dark border border-info text-info font-monospace">
              <i className="fa-solid fa-location-crosshairs me-1"></i>
              {city}, {countryCode}
            </span>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-info btn-sm font-monospace py-0 px-2"
            onClick={centerOnTarget}
            disabled={!hasValidCoords}
            title="Recenter and zoom in on target pin"
          >
            <i className="fa-solid fa-crosshairs me-1"></i>
            LOCK TARGET
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm font-monospace py-0 px-2"
            onClick={viewWorldOverview}
            title="World Overview"
          >
            <i className="fa-solid fa-globe me-1"></i>
            WORLD
          </button>
          <button
            type="button"
            className="btn btn-outline-info btn-sm font-monospace py-0 px-2"
            onClick={copyCoordinates}
            title="Copy Latitude & Longitude"
          >
            <i className={`fa-solid ${copied ? 'fa-check text-success' : 'fa-copy'} me-1`}></i>
            {copied ? 'COPIED' : 'COORDS'}
          </button>
          <button
            type="button"
            className="btn btn-outline-success btn-sm font-monospace py-0 px-2"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Expanded View"
          >
            <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
          </button>
        </div>
      </div>

      {/* Main Interactive Map Viewport */}
      <div
        className="cyber-map-canvas position-relative overflow-hidden user-select-none"
        style={{
          height: isFullscreen ? 'calc(100vh - 120px)' : '420px',
          backgroundColor: '#050911',
          position: 'relative'
        }}
      >
        {/* Tactical Corner Brackets */}
        <div className="hud-corner-tl position-absolute top-0 start-0 p-2 text-success" style={{ pointerEvents: 'none', zIndex: 1000 }}>┌</div>
        <div className="hud-corner-tr position-absolute top-0 end-0 p-2 text-success" style={{ pointerEvents: 'none', zIndex: 1000 }}>┐</div>
        <div className="hud-corner-bl position-absolute bottom-0 start-0 p-2 text-success" style={{ pointerEvents: 'none', zIndex: 1000 }}>└</div>
        <div className="hud-corner-br position-absolute bottom-0 end-0 p-2 text-success" style={{ pointerEvents: 'none', zIndex: 1000 }}>┘</div>

        {/* Tactical Scanline & Vignette Overlay */}
        <div
          className="position-absolute w-100 h-100 top-0 start-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at center, rgba(0, 243, 255, 0.04) 0%, rgba(5, 9, 17, 0.25) 85%),
              linear-gradient(rgba(0, 255, 102, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 100% 3px',
            pointerEvents: 'none',
            zIndex: 999
          }}
        />

        {/* Leaflet DOM container */}
        <div
          ref={mapContainerRef}
          className="cyber-leaflet-container"
          style={{ width: '100%', height: '100%' }}
        />

        {!hasValidCoords && (
          <div
            className="position-absolute top-50 start-50 translate-middle text-center p-3 bg-dark bg-opacity-90 border border-warning rounded"
            style={{ zIndex: 1001, maxWidth: '380px' }}
          >
            <i className="fa-solid fa-triangle-exclamation text-warning fa-2x mb-2"></i>
            <h6 className="text-warning font-monospace">GEOSPATIAL COORDINATES PENDING</h6>
            <p className="text-secondary small mb-0 font-monospace">
              Target IP is private or pending network hop resolution. Public GPS coordinates unavailable.
            </p>
          </div>
        )}
      </div>

      {/* Tactical HUD Footer Telemetry */}
      <div className="d-flex justify-content-between align-items-center bg-black bg-opacity-90 border-top border-success px-3 py-1 font-monospace small text-secondary flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <span>
            <i className="fa-solid fa-crosshairs text-success me-1"></i>
            TARGET: <strong className="text-white">{formatCoord(validLat, validLon)}</strong>
          </span>
          {cursorCoords && (
            <span className="d-none d-md-inline text-info">
              <i className="fa-solid fa-compass text-info me-1"></i>
              CURSOR: {formatCoord(cursorCoords.lat, cursorCoords.lon)}
            </span>
          )}
        </div>

        <div className="d-flex align-items-center gap-3">
          <span>
            ZOOM: <strong className="text-white">{currentZoom}x</strong>
          </span>
          <span className="badge bg-dark border border-success text-success font-monospace py-1 px-2">
            <i className="fa-solid fa-satellite-dish me-1"></i>
            GRID ONLINE
          </span>
        </div>
      </div>
    </div>
  );
};
