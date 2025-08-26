import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Community {
  name: string;
  lat: number;
  lng: number;
}

interface Clinic {
  name: string;
  lat: number;
  lng: number;
}

interface Route {
  from: string;
  to: string;
  distance: number;
  duration: number;
  color: string;
}

interface MapProps {
  communities: Community[];
  clinics: Clinic[];
  routes: Route[];
}

const Map = ({ communities, clinics, routes }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    console.log("Map: Creating map instance...");
    console.log(
      "Map: Container dimensions:",
      mapRef.current.offsetWidth,
      "x",
      mapRef.current.offsetHeight
    );

    // Fix Leaflet icon issues
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    // Create map
    const map = L.map(mapRef.current).setView([55.0, -100.0], 4);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Force a resize to ensure the map renders properly
    setTimeout(() => {
      map.invalidateSize();
      console.log("Map: Invalidated size");
    }, 100);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    console.log("Map: Updating markers and routes...");

    // Clear existing markers and routes
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add communities
    communities.forEach((community) => {
      const marker = L.marker([community.lat, community.lng]).addTo(map)
        .bindPopup(`
          <div class="community-popup">
            <h4>🏘️ ${community.name}</h4>
            <p><strong>Type:</strong> Community</p>
            <p><strong>Coordinates:</strong> ${community.lat.toFixed(
              4
            )}, ${community.lng.toFixed(4)}</p>
          </div>
        `);

      // Custom community icon
      marker.setIcon(
        L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })
      );
    });

    // Add clinics
    clinics.forEach((clinic) => {
      const marker = L.marker([clinic.lat, clinic.lng]).addTo(map).bindPopup(`
          <div class="clinic-popup">
            <h4>🏥 ${clinic.name}</h4>
            <p><strong>Type:</strong> Healthcare Facility</p>
            <p><strong>Coordinates:</strong> ${clinic.lat.toFixed(
              4
            )}, ${clinic.lng.toFixed(4)}</p>
          </div>
        `);

      // Custom clinic icon
      marker.setIcon(
        L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })
      );
    });

    // Add routes
    routes.forEach((route) => {
      const fromCommunity = communities.find((c) => c.name === route.from);
      const toClinic = clinics.find((c) => c.name === route.to);

      if (fromCommunity && toClinic) {
        const polyline = L.polyline(
          [
            [fromCommunity.lat, fromCommunity.lng],
            [toClinic.lat, toClinic.lng],
          ],
          {
            color: route.color,
            weight: 3,
            opacity: 0.7,
          }
        ).addTo(map);

        // Add route popup
        polyline.bindPopup(`
          <div class="route-popup">
            <h4>🛣️ Route</h4>
            <p><strong>From:</strong> ${route.from}</p>
            <p><strong>To:</strong> ${route.to}</p>
            <p><strong>Distance:</strong> ${route.distance.toFixed(1)} km</p>
            <p><strong>Duration:</strong> ${route.duration.toFixed(1)} hours</p>
          </div>
        `);
      }
    });

    // Fit map to show all data
    if (communities.length > 0 || clinics.length > 0) {
      const bounds = L.latLngBounds([
        ...communities.map((c) => [c.lat, c.lng]),
        ...clinics.map((c) => [c.lat, c.lng]),
      ]);
      map.fitBounds(bounds, { padding: [20, 20] });
    }

    // Force resize again after adding content
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [communities, clinics, routes]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-screen"
      style={{
        width: "100%",
        height: "100vh",
        minHeight: "100vh",
        backgroundColor: "#f0f0f0", // Debug background to see the container
      }}
    />
  );
};

export default Map;
