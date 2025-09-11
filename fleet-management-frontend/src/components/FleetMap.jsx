const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Beispiel eines API-Aufrufs
// const response = await fetch(`${API_BASE_URL}/api/vehicles` );

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Truck, Clock, User } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function FleetMap({ locations, vehicles }) {
  const [mapCenter, setMapCenter] = useState([52.5200, 13.4050]) // Berlin default
  const [mapZoom, setMapZoom] = useState(10)

  useEffect(() => {
    // Calculate map center based on locations
    if (locations && locations.length > 0) {
      const avgLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length
      const avgLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length
      setMapCenter([avgLat, avgLng])
      setMapZoom(12)
    }
  }, [locations])

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('de-DE')
  }

  const getVehicleById = (vehicleId) => {
    return vehicles.find(v => v.id === vehicleId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Flottenübersicht</h2>
        <p className="text-gray-600">Aktuelle Standorte aller Fahrzeuge</p>
      </div>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Karte
          </CardTitle>
          <CardDescription>
            Interaktive Karte mit allen Fahrzeugstandorten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96 rounded-lg overflow-hidden">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {locations.map((location) => {
                const vehicle = getVehicleById(location.vehicle_id)
                return (
                  <Marker
                    key={location.id}
                    position={[location.latitude, location.longitude]}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">
                          {vehicle?.vehicle_number || 'Unbekannt'} - {vehicle?.license_plate || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-600">{vehicle?.model || 'Modell unbekannt'}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs">
                            <strong>Koordinaten:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                          </p>
                          {location.address && (
                            <p className="text-xs">
                              <strong>Adresse:</strong> {location.address}
                            </p>
                          )}
                          <p className="text-xs">
                            <strong>Gescannt von:</strong> {location.scanned_by}
                          </p>
                          <p className="text-xs">
                            <strong>Zeit:</strong> {formatDateTime(location.scanned_at)}
                          </p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Location List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Fahrzeugstandorte
          </CardTitle>
          <CardDescription>
            Liste aller aktuellen Fahrzeugpositionen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {locations.length > 0 ? (
            <div className="space-y-4">
              {locations.map((location) => {
                const vehicle = getVehicleById(location.vehicle_id)
                return (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {vehicle?.vehicle_number || 'Unbekannt'} - {vehicle?.license_plate || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-600">{vehicle?.model || 'Modell unbekannt'}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                          </span>
                          {location.address && (
                            <span className="text-xs text-gray-500">
                              {location.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{location.scanned_by}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDateTime(location.scanned_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Noch keine Standorte erfasst</p>
              <p className="text-sm text-gray-400 mt-2">
                Fahrzeugstandorte werden hier angezeigt, sobald QR-Codes gescannt wurden
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesamte Fahrzeuge</p>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Erfasste Standorte</p>
                <p className="text-2xl font-bold">{locations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Letzte Aktualisierung</p>
                <p className="text-sm font-bold">
                  {locations.length > 0 
                    ? formatDateTime(Math.max(...locations.map(l => new Date(l.scanned_at))))
                    : 'Keine Daten'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

