# Interactive Dark Cyber IP Geolocation & Mapping System

Interactive dark cyber map system that geolocates IP addresses, tracks user current IP, and plots real-time coordinates with tactical pins, radar pings, and coordinate telemetry.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following requirements have been confirmed based on your selections in Phase 1:
> - **Visual Display Style**: Interactive dark cyber map with pin and coordinates, styled in terminal green/cyan with high-contrast radar crosshairs, latitude/longitude HUD, and interactive pan/zoom controls.
> - **Display Locations**: Displayed both **inside the scanner results** (for any scanned target domain/IP) and as a **Current Operator IP** detection widget in the Scanner view with one-click location tracing.

- **Confirmed Decision 1**: Interactive dark cyber map featuring animated targeting crosshairs, sonar radar ping, zoom (+/-) and drag-to-pan controls, and live coordinates telemetry HUD.
- **Confirmed Decision 2**: Dual integration: embedded directly in the IP Scanner trace results (`#locationCard`) and an instant "Operator IP Trace" widget allowing users to inspect their current public IP location with a single click.
- **Confirmed Decision 3**: Resilient hybrid mapping engine combining vector landmass geometry, tactical cyber graticules (equator, prime meridian, lat/long grid), and fallback coordinate beacon projection so it loads instantly with zero broken map tiles or API key friction.

---

## 1. Overview & Core Concept

- **What It Does**: Integrates an interactive dark cyber geolocation map into Shadowgrid. When a user executes an IP trace (or clicks "Detect My IP"), the system queries the geolocation coordinates (latitude, longitude, city, country, ISP, ASN), flies the interactive tactical cyber map to the coordinates, drops an animated neon crosshair pin, displays a pulsing radar ping, and renders real-time coordinate telemetries.
- **Target Audience / Persona**: Security analysts, penetration testers, network operators, and cyber enthusiasts who require rapid, visual situational awareness of IP origins and network infrastructure.
- **Key Value**: Replaces plain tabular text with an interactive geospatial interface, providing instant spatial context for threat traces and operator identity.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Operator Current IP Detection**:
   - The user navigates to the **Scanner Tool**.
   - An "Operator Current IP" telemetry banner displays the user's detected public IP with a `[TRACE MY LOCATION]` action button.
   - Clicking the button automatically loads the operator's geolocation and centers the interactive cyber map with coordinate readouts.
2. **Target IP / Domain Scan**:
   - The user enters any domain or IP (e.g. `8.8.8.8`, `github.com`) and clicks **Execute Scan**.
   - As the scanning progress finishes, the results card displays the **Interactive Dark Cyber Map** alongside the ASN and network trace.
   - The map animates smoothly to target coordinates, pulses a radar beacon on the location pin, and displays coordinate tags (`37.7510° N, 122.4200° W`).
3. **Interactive Map Exploration**:
   - The user can drag to pan across world coordinates, zoom in/out with controls or mouse wheel, click "Recenter Target", and hover to inspect latitude/longitude grid coordinates.

### Visual Identity & Theme

- **Aesthetic Direction**: Tactical cyber command center / military HUD aesthetic matching the existing Shadowgrid terminal theme.
- **Color Palette & Mood**:
  - Dominant Canvas: Deep void slate (`#0a0f18` / `#05080e`)
  - Structural Grid: Hairline radar graticule lines (`rgba(0, 255, 102, 0.15)`)
  - Accent Color: Cyber Neon Green (`#00ff66`) and Tactical Cyan (`#00f3ff`)
  - Beacon & Warning Pins: High-visibility amber (`#ffb700`) and breach crimson (`#ff003c`)
- **Typography & Hierarchy**:
  - Display & Headings: `Plus Jakarta Sans` / `Outfit` with crisp letter-spacing
  - Coordinates & Telemetry: `JetBrains Mono` / `font-mono tabular-nums` for rock-solid coordinate alignment
- **Component Styling & Layout**:
  - Map container with dark beveled border, HUD corner brackets (`┌ ┐ └ ┘`), coordinate crosshair overlays, and smooth pan/zoom buttons.
  - Zero-pill metadata tags for city, country code, and ISP information.

### Interactive Feedback & Motion

- Sonar radar sweep animation circling the pinpoint coordinates.
- Pulsing concentric coordinate beacon rings.
- Smooth transition and settling physics on pan and zoom actions.
- Touch target sizing $\ge 40\text{px}$ for zoom buttons and reset actions.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Vector Cyber Map Engine vs. External Commercial Map Tiles**:
  - *Chosen Approach*: Self-contained vector cyber map engine with equirectangular projection, world vector outlines, cyber graticule lines, and animated SVG/Canvas targeting pin.
  - *Why*: Immune to third-party rate limits, API key requirements, CSP blocking, and slow loading in hermetic preview sandboxes, while perfectly matching the dark terminal green/cyan aesthetics.
  - *Alternatives Considered*: Google Maps / Mapbox / OpenStreetMap tiles (require external keys or load light/inconsistent basemaps with potential network failure in sandboxes).
- **Decision 2: Dedicated Backend `/api/my-ip` Endpoint**:
  - *Chosen Approach*: Add a lightweight `/api/my-ip` route in `server.ts` that detects incoming client IP from headers (`x-forwarded-for` / socket) and fetches server-authoritative geolocation via `ipwho.is` / `ip-api.com`.
  - *Why*: Eliminates CORS issues on the client and ensures fast, unified geolocation response format.
  - *Alternatives Considered*: Calling client-side third-party APIs directly (risks browser tracking blockers and mixed-content issues).

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                     Shadowgrid Scanner UI                     │
├───────────────────────────────┬───────────────────────────────┤
│    Operator IP Quick Trace    │     Target Scan Terminal      │
│  [Detect My IP & Location]    │   [targetIP] [Execute Scan]   │
└───────────────┬───────────────┴───────────────┬───────────────┘
                │                               │
                ▼                               ▼
┌───────────────────────────────────────────────────────────────┐
│                Express Backend Server (/api)                  │
│   • GET  /api/my-ip   -> Resolves client IP & Geolocation     │
│   • POST /api/scan    -> Resolves target IP, DNS & Geo Data   │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│               InteractiveDarkCyberMap Component               │
│   • World Vector Contours & Latitude/Longitude Graticule      │
│   • Pan (drag/touch) & Zoom (+ / - / mouse wheel) Controls    │
│   • Beacon Pin: Latitude & Longitude Coordinate Projection     │
│   • Pulsing Radar Sonar Beacon & Coordinate HUD Overlay       │
│   • Recenter Button & Fullscreen / Reset View Affordance      │
└───────────────────────────────────────────────────────────────┘
```

### Data Model & State

```typescript
interface IPGeoLocation {
  success: boolean;
  ip: string;
  target?: string;
  city: string;
  region: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  connection?: {
    isp?: string;
    asn?: string;
    org?: string;
    domain?: string;
  };
  error?: boolean;
  message?: string;
}
```

### Interactive Component & State Mapping

- `currentOperatorGeo`: State storing the user's detected public IP geolocation data.
- `targetGeoData`: State storing the currently scanned IP geolocation data.
- `InteractiveDarkCyberMap`: Modular component accepting `latitude`, `longitude`, `label`, `ip`, and `city/country` props.
- Zoom & pan state managed with transform scale and offset, with bounded zoom levels ($1\times$ to $8\times$) and smooth transitions.
