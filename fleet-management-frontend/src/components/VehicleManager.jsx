const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Beispiel eines API-Aufrufs
// const response = await fetch(`${API_BASE_URL}/api/vehicles` );

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Truck, QrCode, Trash2, Calendar } from 'lucide-react'

export default function VehicleManager({ vehicles, onUpdate }) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [formData, setFormData] = useState({
    vehicle_number: '',
    license_plate: '',
    model: '',
    tuv_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Fahrzeug erfolgreich hinzugefügt!')
        setMessageType('success')
        setFormData({
          vehicle_number: '',
          license_plate: '',
          model: '',
          tuv_date: '',
        })
        setShowAddDialog(false)
        onUpdate()
      } else {
        setMessage(data.error || 'Fehler beim Hinzufügen des Fahrzeugs')
        setMessageType('error')
      }
    } catch (err) {
      setMessage('Verbindungsfehler. Bitte versuchen Sie es erneut.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (vehicleId) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Fahrzeug löschen möchten?')) {
      return
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setMessage('Fahrzeug erfolgreich gelöscht!')
        setMessageType('success')
        onUpdate()
      } else {
        const data = await response.json()
        setMessage(data.error || 'Fehler beim Löschen des Fahrzeugs')
        setMessageType('error')
      }
    } catch (err) {
      setMessage('Verbindungsfehler. Bitte versuchen Sie es erneut.')
      setMessageType('error')
    }
  }

  const showQRCode = async (vehicle) => {
    setSelectedVehicle(vehicle)
    setLoading(true)

    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}/qr`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedVehicle({ ...vehicle, qr_code: data.qr_code, qr_data: data.qr_data })
        setShowQRDialog(true)
      } else {
        setMessage('Fehler beim Laden des QR-Codes')
        setMessageType('error')
      }
    } catch (err) {
      setMessage('Verbindungsfehler beim Laden des QR-Codes')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  const isTUVExpiringSoon = (tuvDate) => {
    const today = new Date()
    const tuv = new Date(tuvDate)
    const diffTime = tuv - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays >= 0
  }

  const isTUVExpired = (tuvDate) => {
    const today = new Date()
    const tuv = new Date(tuvDate)
    return tuv < today
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fahrzeugverwaltung</h2>
          <p className="text-gray-600">Verwalten Sie Ihre Fahrzeugflotte</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Fahrzeug hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Fahrzeug hinzufügen</DialogTitle>
              <DialogDescription>
                Geben Sie die Fahrzeugdaten ein, um es zur Flotte hinzuzufügen.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="vehicle_number">Fahrzeugnummer</Label>
                <Input
                  id="vehicle_number"
                  name="vehicle_number"
                  value={formData.vehicle_number}
                  onChange={handleInputChange}
                  required
                  placeholder="z.B. F001"
                />
              </div>
              <div>
                <Label htmlFor="license_plate">Kennzeichen</Label>
                <Input
                  id="license_plate"
                  name="license_plate"
                  value={formData.license_plate}
                  onChange={handleInputChange}
                  required
                  placeholder="z.B. B-AB 123"
                />
              </div>
              <div>
                <Label htmlFor="model">Modell</Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  placeholder="z.B. VW Golf"
                />
              </div>
              <div>
                <Label htmlFor="tuv_date">TÜV-Datum</Label>
                <Input
                  id="tuv_date"
                  name="tuv_date"
                  type="date"
                  value={formData.tuv_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Wird hinzugefügt...' : 'Fahrzeug hinzufügen'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages */}
      {message && (
        <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Vehicle List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-blue-600" />
                  {vehicle.vehicle_number}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showQRCode(vehicle)}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Kennzeichen:</strong> {vehicle.license_plate}
                </p>
                <p className="text-sm">
                  <strong>Modell:</strong> {vehicle.model}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    <strong>TÜV:</strong> {formatDate(vehicle.tuv_date)}
                  </span>
                  {isTUVExpired(vehicle.tuv_date) && (
                    <Badge variant="destructive">
                      <Calendar className="h-3 w-3 mr-1" />
                      Abgelaufen
                    </Badge>
                  )}
                  {isTUVExpiringSoon(vehicle.tuv_date) && !isTUVExpired(vehicle.tuv_date) && (
                    <Badge variant="secondary">
                      <Calendar className="h-3 w-3 mr-1" />
                      Läuft ab
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vehicles.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Noch keine Fahrzeuge hinzugefügt</p>
            <p className="text-sm text-gray-400 mt-2">
              Klicken Sie auf "Fahrzeug hinzufügen", um zu beginnen
            </p>
          </CardContent>
        </Card>
      )}

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR-Code für {selectedVehicle?.vehicle_number}</DialogTitle>
            <DialogDescription>
              Drucken Sie diesen QR-Code aus und befestigen Sie ihn im Fahrzeug
            </DialogDescription>
          </DialogHeader>
          {selectedVehicle?.qr_code && (
            <div className="text-center space-y-4">
              <img
                src={selectedVehicle.qr_code}
                alt="QR Code"
                className="mx-auto border rounded"
              />
              <div className="text-sm text-gray-600">
                <p><strong>Fahrzeug:</strong> {selectedVehicle.license_plate}</p>
                <p><strong>QR-Daten:</strong> {selectedVehicle.qr_data}</p>
              </div>
              <Button
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = selectedVehicle.qr_code
                  link.download = `qr-code-${selectedVehicle.vehicle_number}.png`
                  link.click()
                }}
                className="w-full"
              >
                QR-Code herunterladen
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

