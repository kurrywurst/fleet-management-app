const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Beispiel eines API-Aufrufs
// const response = await fetch(`${API_BASE_URL}/api/vehicles` );

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QrCode, MapPin, CheckCircle, AlertCircle } from 'lucide-react'

export default function QRScanner({ onScanSuccess }) {
  const [qrData, setQrData] = useState('')
  const [location, setLocation] = useState(null)
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const fileInputRef = useRef(null)

  const getCurrentLocation = () => {
    setLoading(true)
    setMessage('Standort wird ermittelt...')
    setMessageType('info')

    if (!navigator.geolocation) {
      setMessage('Geolocation wird von diesem Browser nicht unterstützt.')
      setMessageType('error')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setMessage('Standort erfolgreich ermittelt!')
        setMessageType('success')
        setLoading(false)
        
        // Reverse geocoding to get address (optional)
        reverseGeocode(position.coords.latitude, position.coords.longitude)
      },
      (error) => {
        setMessage('Fehler beim Ermitteln des Standorts: ' + error.message)
        setMessageType('error')
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      // Using a simple reverse geocoding service (you might want to use a proper service)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=de`
      )
      const data = await response.json()
      if (data.locality || data.city) {
        setAddress(`${data.locality || data.city}, ${data.countryName}`)
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err)
    }
  }

  const handleQRUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // For demo purposes, we'll simulate QR code reading
    // In a real app, you'd use a QR code library like jsQR
    const reader = new FileReader()
    reader.onload = (e) => {
      // Simulate QR code detection
      setMessage('QR-Code-Bild hochgeladen. Bitte geben Sie den QR-Code-Inhalt manuell ein.')
      setMessageType('info')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!qrData.trim()) {
      setMessage('Bitte geben Sie den QR-Code-Inhalt ein.')
      setMessageType('error')
      return
    }

    if (!location) {
      setMessage('Bitte ermitteln Sie zuerst Ihren Standort.')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('Standort wird übermittelt...')
    setMessageType('info')

    try {
      const response = await fetch('${API_BASE_URL}/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          qr_data: qrData.trim(),
          latitude: location.latitude,
          longitude: location.longitude,
          address: address,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Standort erfolgreich für Fahrzeug ${data.vehicle.license_plate} gespeichert!`)
        setMessageType('success')
        setQrData('')
        setLocation(null)
        setAddress('')
        onScanSuccess()
      } else {
        setMessage(data.error || 'Fehler beim Speichern des Standorts')
        setMessageType('error')
      }
    } catch (err) {
      setMessage('Verbindungsfehler. Bitte versuchen Sie es erneut.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="h-5 w-5 mr-2" />
            QR-Code Scanner
          </CardTitle>
          <CardDescription>
            Scannen Sie den QR-Code des Fahrzeugs und übermitteln Sie den Standort
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Input */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="qr-input">QR-Code-Inhalt</Label>
              <Input
                id="qr-input"
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                placeholder="Geben Sie den QR-Code-Inhalt ein oder laden Sie ein Bild hoch"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                QR-Code-Bild hochladen
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleQRUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Aktueller Standort</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={loading}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Standort ermitteln
              </Button>
            </div>
            
            {location && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Koordinaten:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
                {address && (
                  <p className="text-sm text-green-800 mt-1">
                    <strong>Adresse:</strong> {address}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Messages */}
          {message && (
            <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
              {messageType === 'success' && <CheckCircle className="h-4 w-4" />}
              {messageType === 'error' && <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Submit */}
          <form onSubmit={handleSubmit}>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !qrData.trim() || !location}
            >
              {loading ? 'Wird übermittelt...' : 'Standort übermitteln'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

