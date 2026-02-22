import L, { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { MapLocation } from "../../utils/mapToLocations";
import { useLocationContext } from "../../context/LocationContext";

type MapComponentProps = {
  locations: MapLocation[];
  onLocationClick?: (location: MapLocation) => void;
  height?: string;
  center?: [number, number];
  initialZoom?: number;
};

// Definisi Control Kustom untuk Tombol Lokasi
const LocateControl = L.Control.extend({
  onAdd: function (map: any) {
    const container = L.DomUtil.create(
      "div",
      "leaflet-bar leaflet-control custom-locate-control",
    );
    const btn = L.DomUtil.create("button", "", container);

    // Ikon Crosshair / Target mirip Google Maps
    btn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z" fill="#4285F4"/>
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#4285F4"/>
      </svg>
    `;

    // Mencegah klik tombol memicu event peta
    L.DomEvent.disableClickPropagation(btn);
    L.DomEvent.disableScrollPropagation(btn);

    btn.onclick = () => {
      // Memicu event custom agar React bisa menanganinya
      map.fire("locateUser");
    };

    return container;
  },
});

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
    // Ref untuk menyimpan data lokasi terbaru agar bisa diakses di dalam event listener control
    const locationDataRef = useRef<any>(null);

    const { location, loading, error } = useLocationContext();

    // Update ref setiap kali lokasi berubah
    useEffect(() => {
      locationDataRef.current = location;
    }, [location]);

    useEffect(() => {
      if (!mapRef.current) return;

      // Inisialisasi Peta
      const map = L.map(mapRef.current, {
        zoomControl: false, // Kita akan menambahkan zoom control manual di posisi custom
        center: center,
        zoom: initialZoom,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // 1. Tambahkan Zoom Control di posisi bottomright
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // 2. Tambahkan Tombol Lokasi Kustom di posisi bottomright
      // Karena Leaflet menggunakan 'column-reverse' untuk bottom,
      // Kontrol yang ditambahkan terakhir akan muncul di paling atas (di atas Zoom).
      new LocateControl({ position: "bottomright" }).addTo(map);

      // Event Listener untuk tombol lokasi
      map.on("locateUser", () => {
        const currentLoc = locationDataRef.current;
        if (currentLoc && mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(
            [currentLoc.latitude, currentLoc.longitude],
            16, // Zoom level lebih dekat saat mencari lokasi
            { duration: 1.5 },
          );
        }
      });

      // Inject CSS untuk tombol kustom
      const style = document.createElement("style");
      style.innerHTML = `
        .custom-locate-control {
          background: white;
          border: none;
          border-radius: 2px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          margin-bottom: 10px; /* Jarak dari tombol zoom di bawahnya */
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .custom-locate-control:hover {
          background-color: #f8f8f8;
        }
        .custom-locate-control button {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .custom-locate-control button svg {
          display: block;
        }
      `;
      document.head.appendChild(style);

      return () => {
        map.remove();
        document.head.removeChild(style);
      };
    }, []);

    // Marker Lokasi User
    useEffect(() => {
      if (!mapInstanceRef.current || !location) return;

      const map = mapInstanceRef.current;

      // Cek apakah marker user sudah ada (opsional), di sini kita buat baru tiap update simpelnya
      // Untuk produksi, sebaiknya simpan ref marker user agar tidak duplicate
      const userMarker = L.circleMarker(
        [location.latitude, location.longitude],
        {
          radius: 8,
          fillColor: "#1E90FF",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 1,
        },
      ).addTo(map);

      userMarker.bindPopup(`
            <div style="min-width: 150px;">
              <div class="flex flex-col items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
                </svg>
              </div>
              <h6 class="font-bold text-center text-base m-0 mb-1">Lokasi Anda</h6>
              <p class="text-xs text-center text-gray-600 mb-1">${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</p>
            </div>
          `);

      // HAPUS BARIS INI: Agar peta tidak otomatis pindah saat lokasi berubah
      // mapInstanceRef.current.setView([location.latitude, location.longitude], 15);

      return () => {
        userMarker.remove();
      };
    }, [location]);

    function getMarkerIcon(damageType: string) {
      let color = "blue";

      if (damageType === "lubang") color = "red";
      else if (damageType === "alur") color = "orange";
      else if (damageType === "retak") color = "yellow";
      else if (damageType === "tidak_rusak") color = "green";

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

      const newMarkers = locations.map((loc) => {
        const marker = L.marker(loc.coordinates, {
          icon: getMarkerIcon(loc.damageType),
        })
          .addTo(mapInstanceRef.current!)
          .bindPopup(
            `
            <div style="min-width: 150px;">
              <div class="flex flex-col items-center mb-2">
                <div class="w-20 h-20 overflow-hidden rounded-full border-2 border-white shadow-md">
                  <img
                    class="w-full h-full object-cover"
                    src="${loc.image}"
                    alt="${loc.name}"
                  />
                </div>
              </div>
              <h6 class="font-bold text-center text-base m-0 mb-1">${loc.damageType}</h6>
              <p class="text-xs text-center text-gray-600 mb-1">${loc.name}</p>
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
            mapInstanceRef.current.panTo(loc.coordinates);
          }
          onLocationClick?.(loc);
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
