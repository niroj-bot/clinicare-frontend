import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import L from 'leaflet';
import styles from './MapView.module.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const brandIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='36' viewBox='0 0 28 36'><path d='M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z' fill='%231a6b4a'/><circle cx='14' cy='14' r='6' fill='white'/></svg>`,
  iconSize:   [28, 36],
  iconAnchor: [14, 36],
  popupAnchor:[0, -36],
});

// Helper component — re-centers map when clinic changes
function FlyToClinic({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 16, { animate: true, duration: 1 });
    }
  }, [lat, lng]);
  return null;
}

export default function MapView({ clinics, userLocation, focusClinic }) {
  // single clinic to zoom in for detail page
  const center = focusClinic
    ? [focusClinic.latitude, focusClinic.longitude]
    : userLocation
      ? [userLocation.lat, userLocation.lng]
      : [35.6895, 139.6917];

  const zoom = focusClinic ? 16 : 12;

  return (
    <div className={styles.mapWrap}>
      <MapContainer center={center} zoom={zoom} className={styles.map} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
     
        {focusClinic && <FlyToClinic lat={focusClinic.latitude} lng={focusClinic.longitude} />}

        {clinics.map(clinic =>
          clinic.latitude && clinic.longitude ? (
            <Marker
              key={clinic.id}
              position={[clinic.latitude, clinic.longitude]}
              icon={brandIcon}
            >
              <Popup>
                <div className={styles.popup}>
                  <div className={styles.popupName}>{clinic.name}</div>
                  <div className={styles.popupPrice}>
                    From ¥{clinic.lowestPrice?.toLocaleString()}
                  </div>
                  <div className={styles.popupRating}>
                    ⭐ {clinic.averageRating?.toFixed(1)}
                  </div>
                  <Link to={`/clinic/${clinic.id}`} className={styles.popupLink}>
                    View clinic →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}
