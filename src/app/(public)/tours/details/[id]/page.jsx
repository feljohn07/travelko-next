import TourDetailsClient from "@/components/TourDetailsClient";

export default async function TourDetailsPage({ params }) {
  const { id } = await params;
  let tourData = null;

  try {
    const [tourRes, allToursRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.travelkoph.com/"}tours/${id}`,
        { next: { revalidate: 10 } } // Refresh details every 10 seconds for real-time reviews
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.travelkoph.com/"}tours`,
        { next: { revalidate: 60 } }
      ),
    ]);

    if (tourRes.ok && allToursRes.ok) {
      const tourDetails = await tourRes.json();
      const allTours = await allToursRes.json();

      const matchedTour = allTours.find((t) => t._id === tourDetails._id);
      const coordinator = matchedTour?.createdBy || null;

      tourData = {
        ...tourDetails,
        coordinator,
      };
    }
  } catch (err) {
    console.error("Failed to load tour details server-side", err);
  }

  if (!tourData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500 font-semibold">Tour not found</p>
      </div>
    );
  }

  return <TourDetailsClient tour={tourData} tourId={id} />;
}

// Generate meta details dynamically for dynamic SEO (Title & Cover Image)
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.travelkoph.com/"}tours/${id}`
    );
    if (res.ok) {
      const tour = await res.json();
      return {
        title: tour.title,
        description: tour.details?.slice(0, 160) || "Discover adventures.",
        openGraph: {
          images: tour.pictureUrls?.[0] ? [tour.pictureUrls[0]] : [],
        },
      };
    }
  } catch {
    // Ignore meta load error
  }
  return { title: "Adventure Details" };
}
