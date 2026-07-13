"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Helper to check for valid latitude/longitude
const hasValidCoords = (tour) => {
  const lat = Number(tour.latitude);
  const lng = Number(tour.longitude);
  return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
};

// Create a custom SVG icon for markers
const createCustomIcon = (category, isSelected = false) => {
  const color = isSelected ? "#15803d" : "#16a34a"; // brand-dark vs brand
  const size = isSelected ? "40px" : "32px";
  const iconHtml = `
    <div style="width: ${size}; height: ${size}; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15)); transition: all 0.2s ease-in-out;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" style="width: 100%; height: 100%;">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: "custom-map-marker",
    iconSize: isSelected ? [40, 40] : [32, 32],
    iconAnchor: isSelected ? [20, 40] : [16, 32],
    popupAnchor: [0, isSelected ? -38 : -30],
  });
};

export default function MapComponent({ tours, selectedTourId, onSelectTour }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered at Philippines
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView([12.8797, 121.774], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.control.zoom({
      position: "bottomright",
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Sync Markers and bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    const validTours = tours.filter(hasValidCoords);

    if (validTours.length === 0) return;

    const bounds = [];

    validTours.forEach((tour) => {
      const lat = Number(tour.latitude);
      const lng = Number(tour.longitude);
      bounds.push([lat, lng]);

      const isSelected = tour.id === selectedTourId || tour._id === selectedTourId;
      const markerIcon = createCustomIcon(tour.category, isSelected);

      const picture = tour.pictureUrls?.[0] || "/tour1.jpg";
      const price = Number(tour.joinerPrice).toLocaleString();
      const popupContent = `
        <div class="w-48 text-gray-800 font-sans p-1">
          <img src="${picture}" class="w-full h-24 object-cover rounded-lg mb-2" alt="${tour.title}" />
          <h4 class="font-bold text-sm text-gray-900 mb-1 leading-snug line-clamp-1">${tour.title}</h4>
          <p class="text-xs text-gray-500 mb-1 line-clamp-1">${tour.address}</p>
          <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
            <span class="font-extrabold text-sm text-green-600">₱${price}</span>
            <a href="/tours/details/${tour.id || tour._id}" class="text-[11px] font-bold text-green-600 hover:text-green-700 hover:underline">
              View Details →
            </a>
          </div>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(popupContent, {
          closeButton: false,
          className: "custom-leaflet-popup",
          autoPan: false,
        });

      // Track selection
      marker.on("click", () => {
        onSelectTour(tour.id || tour._id);
      });

      markersRef.current[tour.id || tour._id] = marker;
    });

    // Auto fit bounds on initial load / filter updates
    if (bounds.length > 0 && !selectedTourId) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 12,
      });
    }
  }, [tours, onSelectTour, selectedTourId]);

  // 3. Handle selection change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedTourId) return;

    const marker = markersRef.current[selectedTourId];
    if (marker) {
      const latLng = marker.getLatLng();
      map.flyTo(latLng, 12, {
        animate: true,
        duration: 1.0,
      });
      
      // Wait slightly for flyTo to begin/complete or open immediately
      marker.openPopup();

      // Refresh icons so selected one stands out
      Object.entries(markersRef.current).forEach(([id, m]) => {
        const tour = tours.find((t) => (t.id || t._id) === id);
        if (tour) {
          const isSelected = String(id) === String(selectedTourId);
          m.setIcon(createCustomIcon(tour.category, isSelected));
        }
      });
    }
  }, [selectedTourId, tours]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      {/* Custom Styles for Leaflet Popup to match our design */}
      <style jsx global>{`
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          border-radius: 1rem;
          padding: 4px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid #f3f4f6;
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 4px;
        }
        .custom-leaflet-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
