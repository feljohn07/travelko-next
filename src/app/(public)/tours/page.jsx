import ToursClient from "@/components/ToursClient";

export default async function ToursPage({ searchParams }) {
  let tours = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.travelko.site/"}tours`,
      { next: { revalidate: 30 } } // ISR: validate every 30 seconds
    );
    if (res.ok) {
      tours = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch tours server-side", err);
  }

  const resolvedParams = await searchParams;
  const category = resolvedParams?.category || "all";

  return <ToursClient initialTours={tours} initialCategory={category} />;
}
