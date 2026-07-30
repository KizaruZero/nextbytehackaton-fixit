import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default marker icon broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom brutal marker icon
const brutalIcon = new L.DivIcon({
  html: `<div style="
    width:28px;height:28px;
    background:#4D61FC;
    border:3px solid #111;
    box-shadow:3px 3px 0 #111;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  className: '',
});

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function LocationPicker({ coords, onPick, readonly = false }) {
  const defaultCenter = coords
    ? [coords.lat, coords.lng]
    : [-6.2088, 106.8456]; // Jakarta default

  return (
    <div className="border-3 border-ink shadow-brutal overflow-hidden" style={{ height: 280 }}>
      <MapContainer
        center={defaultCenter}
        zoom={coords ? 15 : 11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={!readonly}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!readonly && <ClickHandler onPick={onPick} />}
        {coords && (
          <Marker position={[coords.lat, coords.lng]} icon={brutalIcon} />
        )}
      </MapContainer>
    </div>
  );
}
