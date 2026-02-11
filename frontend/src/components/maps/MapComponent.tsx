// src/pages/user/MapComponent.tsx
import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocationType } from "../../data/dummyLocations";

type MapComponentProps = {
  locations: LocationType[];
  onLocationClick?: (location: LocationType) => void;
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
    }, [center, initialZoom]);

    useEffect(() => {
      if (!mapInstanceRef.current) return;

      // hapus marker lama
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const newMarkers = locations.map((location) => {
        const marker = L.marker(location.coordinates)
          .addTo(mapInstanceRef.current!)
          .bindPopup(
            `
            <div>
              <h6>${location.name}</h6>
              <p><strong>Jenis:</strong> ${location.damageType}</p>
              <p><strong>Severity:</strong> ${location.severity}</p>
              <p>${location.description}</p>
            </div>
          `,
          )
          .on("click", () => {
            onLocationClick?.(location);
          });

        return marker;
      });

      markersRef.current = newMarkers;
    }, [locations, onLocationClick]);

    // expose function ke parent (optional)
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
