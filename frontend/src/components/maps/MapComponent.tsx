import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { MapLocation } from "../../utils/mapToLocations";

type MapComponentProps = {
  locations: MapLocation[];
  onLocationClick?: (location: MapLocation) => void;
  height?: string;
  center?: [number, number];
  initialZoom?: number;
};

const MapComponent = forwardRef<any, MapComponentProps>(
  (
    {
      locations,
      onLocationClick,
      height = "500px",
      center = [-2.2136, 113.9108],
      initialZoom = 13,
    },
    ref,
  ) => {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
      if (!mapRef.current) return;

      // Inisialisasi peta
      mapInstanceRef.current = L.map(mapRef.current).setView(
        center,
        initialZoom,
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapInstanceRef.current);

      return () => {
        mapInstanceRef.current?.remove();
      };
    }, []);

    function getMarkerIcon(damageType: string) {
      let color = "blue";

      if (damageType === "lubang") color = "red";
      else if (damageType === "alur") color = "orange";
      else if (damageType === "retak") color = "green";
      else if (damageType === "tidak_rusak") color = "blue";

      return L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background:${color};
            width:18px;
            height:18px;
            border-radius:50%;
            border:2px solid white;
            box-shadow:0 0 4px rgba(0,0,0,0.4);
          "></div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
    }

    useEffect(() => {
      if (!mapInstanceRef.current) return;

      // Hapus marker lama
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const newMarkers = locations.map((location) => {
        const marker = L.marker(location.coordinates, {
          icon: getMarkerIcon(location.damageType),
        })
          .addTo(mapInstanceRef.current!)
          .bindPopup(
            `
            <div style="min-width: 150px;">
              <div class="flex flex-col items-center mb-2">
                <!-- Container Gambar: Persegi, Overflow Hidden, Rounded -->
                <div class="w-20 h-20 overflow-hidden rounded-full border-2 border-white shadow-md">
                  <!-- Gambar: object-cover agar crop rapi & pas di kotak -->
                  <img
                    class="w-full h-full object-cover"
                    src="${location.image}"
                    alt="${location.name}"
                  />
                </div>
              </div>
              <h6 class="font-bold text-center text-base m-0 mb-1">${location.damageType}</h6>
              <p class="text-xs text-center text-gray-600 mb-1">${location.name}</p>
            </div>
          `,
          );

        marker.on("mouseover", () => {
          marker.openPopup();
        });

        marker.on("mouseout", () => {
          marker.closePopup();
        });

        marker.on("click", () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo(location.coordinates);
          }
          onLocationClick?.(location);
        });

        return marker;
      });

      markersRef.current = newMarkers;
    }, [locations, onLocationClick]);

    // Expose function ke parent
    useImperativeHandle(ref, () => ({
      fitAllMarkers: () => {
        if (!mapInstanceRef.current || locations.length === 0) return;
        const bounds = L.latLngBounds(locations.map((l) => l.coordinates));
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      },
    }));

    return <div ref={mapRef} style={{ height, width: "100%" }} />;
  },
);

export default MapComponent;
