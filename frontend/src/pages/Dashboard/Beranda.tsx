// src/pages/user/BerandaPage.tsx
import { useRef, useState } from "react";
import MapComponent from "../../components/maps/MapComponent";
import { dummyLocations, LocationType } from "../../data/dummyLocations";

const BerandaPage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(
    null,
  );

  const mapRef = useRef<any>(null);

  // Handler klik marker
  const handleLocationClick = (location: LocationType) => {
    setSelectedLocation(location);
  };

  return (
    <div className="w-full h-screen relative">
      <MapComponent
        ref={mapRef}
        locations={dummyLocations}
        onLocationClick={handleLocationClick}
        height="100%"
      />
    </div>
  );
};

export default BerandaPage;
