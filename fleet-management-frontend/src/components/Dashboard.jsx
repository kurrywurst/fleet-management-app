const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Beispiel eines API-Aufrufs
// const response = await fetch(`${API_BASE_URL}/api/vehicles` );

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogOut, Truck, MapPin, QrCode, Plus } from 'lucide-react'
import QRScanner from './QRScanner'
import VehicleManager from './VehicleManager'
import FleetMap from './FleetMap'

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('map')
  const [vehicles, setVehicles] = useState([])
  const [locations, setLocations] = useState([])

  useEffect(() => {
    fetchVehicles()
    fetchLocations()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (err) {
      console.error('Error fetching locations:', err)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      onLogout()
    } catch (err) {
      console.error('Logout error:', err)
      onLogout()
    }
  }

  const refreshData = () => {
    fetchVehicles()
    fetchLocations()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Flottenmanagement
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {user.role === 'manager' ? 'Manager' : 'Fahrer'}
              </Badge>
              <span className="text-sm text-gray-700">{user.username}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('map')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'map'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapPin className="h-4 w-4 inline mr-2" />
              Flottenübersicht
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'scanner'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <QrCode className="h-4 w-4 inline mr-2" />
              QR-Code Scanner
            </button>
            {user.role === 'manager' && (
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'vehicles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Fahrzeugverwaltung
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'map' && (
            <FleetMap locations={locations} vehicles={vehicles} />
          )}
          {activeTab === 'scanner' && (
            <QRScanner onScanSuccess={refreshData} />
          )}
          {activeTab === 'vehicles' && user.role === 'manager' && (
            <VehicleManager vehicles={vehicles} onUpdate={refreshData} />
          )}
        </div>
      </main>
    </div>
  )
}

