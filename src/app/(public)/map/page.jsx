import MapClient from "@/components/MapClient";

export const metadata = {
  title: "Tours Map Explorer",
  description: "Find available tours across the Philippines on our interactive map.",
};

export default async function MapPage() {
  let tours = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.travelkoph.com/"}tours`,
      { next: { revalidate: 30 } } // ISR: validate every 30 seconds
    );
    if (res.ok) {
      tours = await res.json();
    } else {
      console.error("Failed to fetch tours: API returned status", res.status);
    }
  } catch (err) {
    console.error("Failed to fetch tours server-side for map page", err);
  }

  return <MapClient tours={tours} />;
}
