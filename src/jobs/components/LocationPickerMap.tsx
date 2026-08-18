import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const markerIcon = L.divIcon({
  className: '',
  html: `<span style="display:block;width:22px;height:22px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

interface LocationPickerMapProps {
  latitude: number
  longitude: number
  onChange: (latitude: number, longitude: number) => void
}

function ClickHandler({ onChange }: Pick<LocationPickerMapProps, 'onChange'>) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

function RecenterOnChange({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom(), { animate: true })
  }, [latitude, longitude, map])
  return null
}

export function LocationPickerMap({ latitude, longitude, onChange }: LocationPickerMapProps) {
  return (
    <div className="h-56 w-full overflow-hidden rounded-lg border border-border">
      <MapContainer
        center={[latitude, longitude]}
        zoom={11}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[latitude, longitude]}
          icon={markerIcon}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const position = (event.target as L.Marker).getLatLng()
              onChange(position.lat, position.lng)
            },
          }}
        />
        <ClickHandler onChange={onChange} />
        <RecenterOnChange latitude={latitude} longitude={longitude} />
      </MapContainer>
    </div>
  )
}
