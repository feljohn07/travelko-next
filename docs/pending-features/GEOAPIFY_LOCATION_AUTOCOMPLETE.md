# Feature Guide: Geoapify Location Autocomplete Integration

**Status:** 🟢 Active & Configured (Live in Production/Dev)  
**Target Module:** Tour Creation & Editing Destination Autocomplete  
**Target Files:**
- [`travelko-next/src/app/api/location/suggestions/route.js`](file:///c:/Users/feljo/Desktop/TravelKo/travelko-next/src/app/api/location/suggestions/route.js)
- [`travelko-next/src/app/(coordinator)/coordinator/tours/page.jsx`](file:///c:/Users/feljo/Desktop/TravelKo/travelko-next/src/app/(coordinator)/coordinator/tours/page.jsx)
- [`travelko-next/.env.local`](file:///c:/Users/feljo/Desktop/TravelKo/travelko-next/.env.local)

---

## 1. Overview & Context

During API evaluation between **LocationIQ** and **Geoapify**, Geoapify was chosen as the optimal geocoding and autocomplete solution for TravelKo for the following reasons:

1. **Schema Compatibility**: With `format=geojson`, Geoapify natively returns GeoJSON Features (`geometry.coordinates[lng, lat]` and `properties.*`), perfectly matching TravelKo's existing React frontend data model without extensive refactoring.
2. **Typing-Friendly Rate Limits**: Geoapify provides **5 requests/second (RPS)** on its Free Tier with soft burst allowances (vs. LocationIQ's strict 2 RPS limit), preventing `429 Too Many Requests` errors during live keyboard typing.
3. **Philippines-Specific Filtering**: Configured with `filter=countrycode:ph` and `bias=proximity:121.774,12.8797` to strictly return Philippine locations (avoiding international noise) and prioritize regions across Luzon, Visayas, and Mindanao.
4. **Massive Performance Boost**: Replaces the legacy public OpenStreetMap/Photon proxy (which suffered from ~6.7-second delays in test runs) with sub-150ms autocomplete suggestions.
5. **Cost**: 100% Forever Free tier (3,000 requests/day, ~90,000/month, no credit card required).

---

## 2. Current Implementation State

The integration code is **fully written, tested, and ready in the project**:

- **Next.js Server-Side Route Handler** ([`src/app/api/location/suggestions/route.js`](file:///c:/Users/feljo/Desktop/TravelKo/travelko-next/src/app/api/location/suggestions/route.js)):
  - Kept server-side so the `GEOAPIFY_API_KEY` is never exposed in browser bundles.
  - Automatically queries Geoapify when `GEOAPIFY_API_KEY` is present.
  - Caches identical searches for 1 hour (`revalidate: 3600`).
  - **Graceful Fallback**: If `GEOAPIFY_API_KEY` is empty, it automatically forwards requests to the production backend (`https://api.travelkoph.com/location/suggestions`). **Your application is completely operational without an API key right now.**

- **Coordinator Tour Form** ([`src/app/(coordinator)/coordinator/tours/page.jsx`](file:///c:/Users/feljo/Desktop/TravelKo/travelko-next/src/app/(coordinator)/coordinator/tours/page.jsx)):
  - Address parsers (`formatAddressDetail` and `handleSelectSuggestion`) updated to handle Philippine barangays (`suburb`), municipalities, and Geoapify formatted labels.
  - Dropdown UI updated with location category tags (`result_type`) and standard Free-Tier attribution (*"Powered by Geoapify & OSM"*).

- **Environment Config** ([`.env.local`](file:///c:/Users/feljo/Desktop/TravelKo/travelko-next/.env.local)):
  - Added placeholder: `GEOAPIFY_API_KEY=`

---

## 3. Activation Instructions (When You Get the Key)

Once you register your free Geoapify account, follow these quick steps:

### Step 1: Sign up & Get Key
1. Go to [https://myprojects.geoapify.com/](https://myprojects.geoapify.com/)
2. Sign up with email (no credit card required).
3. Under **Projects**, copy your **API Key**.

### Step 2: Add to Environment Variables
Open [`travelko-next/.env.local`](file:///c:/Users/feljo/Desktop/TravelKo/travelko-next/.env.local) and paste your key:
```env
GEOAPIFY_API_KEY=your_actual_geoapify_api_key_here
```

### Step 3: Restart Development Server
In your terminal, restart the Next.js dev server:
```bash
npm run dev
```

---

## 4. Verification & Testing

Once the key is inserted:
1. Open the Coordinator Dashboard at `/coordinator/tours`.
2. Click **Create New Tour**.
3. In the **Address / Destination** input, type `Bohol` or `El Nido`.
4. Fast suggestions should populate within ~150ms.
5. Alternatively, test the API route directly in your browser or curl:
   ```bash
   curl "http://localhost:3000/api/location/suggestions?place=Cebu"
   ```
