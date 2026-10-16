import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useAdvancedMarkerRef
} from '@vis.gl/react-google-maps';

export interface GoogleCyberMapProps {
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

// Controller component to smoothly center on target coordinates when updated
const MapController: React.FC<{
  targetPos: { lat: number; lng: number };
  hasValidCoords: boolean;
  recenterCount: number;
  worldCount: number;
}> = ({ targetPos, hasValidCoords, recenterCount, worldCount }) => {
  const map = useMap();

  useEffect(() => {
    if (map && hasValidCoords) {
      map.panTo(targetPos);
      if (map.getZoom() !== undefined && map.getZoom()! < 6) {
        map.setZoom(8);
      }
    }
  }, [map, targetPos.lat, targetPos.lng, hasValidCoords, recenterCount]);

  useEffect(() => {
    if (map && worldCount > 0) {
      map.panTo({ lat: 20, lng: 0 });
      map.setZoom(2);
    }
  }, [map, worldCount]);

  return null;
};

export const GoogleCyberMap: React.FC<GoogleCyberMapProps> = ({
  latitude,
  longitude,
  ip = '127.0.0.1',
  target,
  city = 'Unknown',
  region = 'Unknown',
  country = 'Global',
  countryCode = 'XX',
  isp = 'Network Carrier',
  asn = 'Unknown',
  title = 'GOOGLE MAPS GEOSPATIAL RADAR LOCK',
  className = ''
}) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || 'AIzaSyCmmm2JihWPvi7tTXoHJ4DzKSsPTf_Babg';

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mapTypeId, setMapTypeId] = useState<string>('roadmap');
  const [infoWindowOpen, setInfoWindowOpen] = useState(true);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [recenterCount, setRecenterCount] = useState(0);
  const [worldCount, setWorldCount] = useState(0);

  // Validate coordinates safely
  const validLat = Number.isFinite(latitude) && latitude !== 0 ? Math.max(-85, Math.min(85, latitude)) : latitude || 0;
  const validLon = Number.isFinite(longitude) && longitude !== 0 ? Math.max(-180, Math.min(180, longitude)) : longitude || 0;
  const hasValidCoords = Number.isFinite(validLat) && Number.isFinite(validLon) && !(validLat === 0 && validLon === 0);

  const targetPosition = useMemo(
    () => ({ lat: validLat || 20, lng: validLon || 0 }),
    [validLat, validLon]
  );

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

  return (
    <div className={`cyber-map-wrapper position-relative ${className} ${isFullscreen ? 'fixed-top w-100 h-100 bg-dark p-3 z-3' : ''}`}>
      {/* Tactical HUD Header */}
      <div className="d-flex justify-content-between align-items-center bg-black bg-opacity-75 border-bottom border-success px-3 py-2 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="badge bg-success text-black font-monospace fw-bold px-2 py-1">
            <i className="fa-brands fa-google me-1"></i>
            GOOGLE MAPS ACTIVE
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

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-outline-info btn-sm font-monospace py-0 px-2"
            onClick={() => setRecenterCount(c => c + 1)}
            disabled={!hasValidCoords}
            title="Recenter and focus on target coordinates"
          >
            <i className="fa-solid fa-crosshairs me-1"></i>
            LOCK TARGET
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm font-monospace py-0 px-2"
            onClick={() => setWorldCount(c => c + 1)}
            title="Global Overview"
          >
            <i className="fa-solid fa-globe me-1"></i>
            WORLD
          </button>

          {/* Map Type Mode Toggle */}
          <div className="btn-group btn-group-sm font-monospace" role="group">
            <button
              type="button"
              className={`btn btn-sm py-0 px-2 ${mapTypeId === 'roadmap' ? 'btn-success text-black fw-bold' : 'btn-outline-secondary'}`}
              onClick={() => setMapTypeId('roadmap')}
              title="Standard Map"
            >
              ROAD
            </button>
            <button
              type="button"
              className={`btn btn-sm py-0 px-2 ${mapTypeId === 'hybrid' ? 'btn-success text-black fw-bold' : 'btn-outline-secondary'}`}
              onClick={() => setMapTypeId('hybrid')}
              title="Satellite Hybrid"
            >
              HYBRID
            </button>
            <button
              type="button"
              className={`btn btn-sm py-0 px-2 ${mapTypeId === 'terrain' ? 'btn-success text-black fw-bold' : 'btn-outline-secondary'}`}
              onClick={() => setMapTypeId('terrain')}
              title="Terrain Map"
            >
              TERRAIN
            </button>
          </div>

          <button
            type="button"
            className="btn btn-outline-info btn-sm font-monospace py-0 px-2"
            onClick={copyCoordinates}
            title="Copy Coordinates"
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

      {/* Main Google Maps Viewport */}
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

        {/* APIProvider & Google Map Component */}
        <APIProvider apiKey={apiKey}>
          <div style={{ width: '100%', height: '100%' }}>
            <Map
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              colorScheme="DARK"
              defaultCenter={targetPosition}
              defaultZoom={hasValidCoords ? 8 : 2}
              gestureHandling="greedy"
              disableDefaultUI={false}
              mapTypeId={mapTypeId}
              style={{ width: '100%', height: '100%' }}
            >
              <MapController
                targetPos={targetPosition}
                hasValidCoords={hasValidCoords}
                recenterCount={recenterCount}
                worldCount={worldCount}
              />

              {hasValidCoords && (
                <>
                  <AdvancedMarker
                    ref={markerRef}
                    position={targetPosition}
                    title={`Target: ${ip} (${city})`}
                    onClick={() => setInfoWindowOpen(!infoWindowOpen)}
                  >
                    <Pin
                      background={'#00ff66'}
                      borderColor={'#003311'}
                      glyphColor={'#000000'}
                      scale={1.25}
                    />
                  </AdvancedMarker>

                  {infoWindowOpen && marker && (
                    <InfoWindow
                      anchor={marker}
                      maxWidth={260}
                      onCloseClick={() => setInfoWindowOpen(false)}
                    >
                      <div style={{ padding: '4px', color: '#111827', fontFamily: 'monospace' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #10b981', paddingBottom: '4px', marginBottom: '6px' }}>
                          <span style={{ color: '#059669', fontSize: '11px', fontWeight: 'bold' }}>
                            [TARGET RADAR LOCK]
                          </span>
                          <span style={{ background: '#ecfdf5', color: '#047857', padding: '1px 5px', fontSize: '10px', borderRadius: '2px' }}>
                            {countryCode}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827', marginBottom: '2px' }}>
                          {ip}
                        </div>
                        {target && target !== ip && (
                          <div style={{ fontSize: '11px', color: '#0284c7', marginBottom: '4px' }}>
                            Host: {target}
                          </div>
                        )}
                        <div style={{ fontSize: '12px', color: '#4b5563', marginBottom: '4px' }}>
                          📍 {city}{region && region !== city ? `, ${region}` : ''}, {country}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280', borderTop: '1px dashed #d1d5db', paddingTop: '4px', marginTop: '4px' }}>
                          <div><strong>Coords:</strong> {validLat.toFixed(4)}, {validLon.toFixed(4)}</div>
                          {asn && asn !== 'Unknown' && <div><strong>ASN:</strong> AS{asn}</div>}
                          {isp && isp !== 'Network Carrier' && <div><strong>Carrier:</strong> {isp}</div>}
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </>
              )}
            </Map>
          </div>
        </APIProvider>

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
        </div>

        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-dark border border-success text-success font-monospace py-1 px-2">
            <i className="fa-brands fa-google me-1"></i>
            GOOGLE MAPS PLATFORM
          </span>
          <span className="badge bg-dark border border-info text-info font-monospace py-1 px-2">
            <i className="fa-solid fa-satellite-dish me-1"></i>
            GRID ONLINE
          </span>
        </div>
      </div>
    </div>
  );
};
