'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import ZoneList from '@/components/ZoneList';
import { EmissionZone, processEmissionZonesData } from '@/lib/data-processor';
import { MapPin, Shield, AlertTriangle, Info } from 'lucide-react';

// Dynamically import the map component to avoid SSR issues
const EmissionZoneMap = dynamic(() => import('@/components/EmissionZoneMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Kaart laden...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [zones, setZones] = useState<EmissionZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<EmissionZone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadZones = async () => {
      try {
        console.log('Loading emission zones...');
        const zonesData = await processEmissionZonesData();
        console.log('Loaded zones:', zonesData.length);
        setZones(zonesData);
      } catch (err) {
        console.error('Error loading zones:', err);
        setError('Er is een fout opgetreden bij het laden van de emissiezones.');
      } finally {
        setLoading(false);
      }
    };

    loadZones();
  }, []);

  const stats = {
    totalZones: zones.length,
    zeZones: zones.filter(zone => zone.type === 'ZE').length,
    lezZones: zones.filter(zone => zone.type === 'LEZ').length,
    activeZones: zones.filter(zone => zone.status === 'active').length,
    upcomingZones: zones.filter(zone => zone.status === 'upcoming').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Emissiezones laden...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Nederlandse Emissiezones
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Interactieve kaart met Nul-emissie Zones (ZE) en Lage-emissie Zones 
              (LEZ) in Nederlandse steden. Controleer voertuigbeperkingen, vrijstellingen en 
              nalevingseisen.
            </p>
            
            {/* Zone Type Legend */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-secondary-400 rounded-full"></div>
                <span className="text-gray-700 font-medium">Nul-emissie Zones</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Lage-emissie Zones</span>
              </div>
            </div>

            {/* Statistics */}
            {!loading && zones.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="bg-white rounded-xl p-6 card-shadow">
                  <div className="text-3xl font-bold text-secondary-500 mb-2">{stats.zeZones}</div>
                  <div className="text-gray-600 font-medium">ZE Zones</div>
                </div>
                <div className="bg-white rounded-xl p-6 card-shadow">
                  <div className="text-3xl font-bold text-primary-500 mb-2">{stats.lezZones}</div>
                  <div className="text-gray-600 font-medium">LEZ Zones</div>
                </div>
                <div className="bg-white rounded-xl p-6 card-shadow">
                  <div className="text-3xl font-bold text-orange-500 mb-2">{stats.upcomingZones}</div>
                  <div className="text-gray-600 font-medium">Binnenkort actief</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Emissiezones laden...</h2>
              <p className="text-gray-600">Dit kan even duren.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Zone List Sidebar */}
              <div className="lg:col-span-1">
                <ZoneList
                  zones={zones}
                  selectedZone={selectedZone}
                  onZoneSelect={setSelectedZone}
                />
              </div>

              {/* Map */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl card-shadow p-4 h-[600px]">
                  <EmissionZoneMap
                    zones={zones}
                    selectedZone={selectedZone}
                    onZoneSelect={setSelectedZone}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Info className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Over Emissiezones</h2>
            <p className="text-lg text-gray-600">
              Emissiezones helpen luchtkwaliteit te verbeteren door toegang te beperken voor 
              bepaalde voertuigen op basis van emissienormen en brandstoftype.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-secondary-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-secondary-400 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Nul-emissie Zones (ZE)</h3>
              <p className="text-gray-600">
                Gebieden waar alleen voertuigen zonder lokale uitstoot (elektrisch, waterstof) 
                mogen rijden. Deze zones worden geleidelijk ingevoerd in Nederlandse steden.
              </p>
            </div>
            
            <div className="bg-primary-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lage-emissie Zones (LEZ)</h3>
              <p className="text-gray-600">
                Gebieden met beperkingen voor oudere dieselvoertuigen die niet voldoen aan 
                moderne emissienormen (Euro 5/6). Bestaande zones in verschillende steden.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 