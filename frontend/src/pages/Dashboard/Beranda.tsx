// src/pages/user/BerandaPage.tsx
import { useRef, useState } from "react";
import MapComponent from "../../components/maps/MapComponent";
import { useClassificationHistory } from "../../hooks/useClassificationHistory";
import { MapLocation, mapToLocations } from "../../utils/mapToLocations";

const BerandaPage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null,
  );

  const { data } = useClassificationHistory();

  // mapping dari API → map format
  const locations = mapToLocations(data);

  const mapRef = useRef<any>(null);

  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location);
  };

  return (
    <div className="w-full h-screen relative">
      <MapComponent
        ref={mapRef}
        locations={locations}
        onLocationClick={handleLocationClick}
        height="100%"
      />
    </div>
  );
};

export default BerandaPage;
