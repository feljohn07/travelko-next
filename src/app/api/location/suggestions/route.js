export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const place = searchParams.get("place");

    if (!place || place.trim().length < 3) {
      return Response.json([]);
    }

    const apiKey = process.env.GEOAPIFY_API_KEY;

    // 1. If Geoapify API key is present, query Geoapify with Philippines-specific filters
    if (apiKey) {
      const geoapifyUrl = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
      geoapifyUrl.searchParams.set("text", place.trim());
      geoapifyUrl.searchParams.set("format", "geojson");
      geoapifyUrl.searchParams.set("filter", "countrycode:ph");
      geoapifyUrl.searchParams.set("bias", "proximity:121.774,12.8797"); // Centered on the Philippines
      geoapifyUrl.searchParams.set("limit", "8");
      geoapifyUrl.searchParams.set("apiKey", apiKey);

      const response = await fetch(geoapifyUrl.toString(), {
        next: { revalidate: 3600 }, // Cache identical queries for 1 hour
      });

      if (response.ok) {
        const data = await response.json();
        const features = Array.isArray(data?.features) ? data.features : [];
        return Response.json(features);
      } else {
        console.warn(
          `[Geoapify] Autocomplete request failed with status ${response.status}. Falling back to default backend.`
        );
      }
    }

    // 2. Graceful fallback to existing TravelKo production backend suggestions endpoint
    const backendBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.travelkoph.com/";
    const normalizedBase = backendBase.endsWith("/") ? backendBase : `${backendBase}/`;
    const fallbackUrl = `${normalizedBase}location/suggestions?place=${encodeURIComponent(
      place.trim()
    )}`;

    try {
      const fallbackRes = await fetch(fallbackUrl, {
        next: { revalidate: 3600 },
      });

      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        return Response.json(Array.isArray(fallbackData) ? fallbackData : []);
      }
    } catch (fallbackError) {
      console.warn("[Location Suggestions Fallback Error]:", fallbackError?.message || fallbackError);
    }

    return Response.json([]);
  } catch (error) {
    console.error("[Location Suggestions Error]:", error?.message || error);
    return Response.json([]);
  }
}
