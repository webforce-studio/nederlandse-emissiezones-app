'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, MapPin, Calendar, Shield, AlertTriangle } from 'lucide-react';
import { EmissionZone } from '@/lib/data-processor';

interface ZoneListProps {
  zones: EmissionZone[];
  selectedZone: EmissionZone | null;
  onZoneSelect: (zone: EmissionZone | null) => void;
}

export default function ZoneList({ zones, selectedZone, onZoneSelect }: ZoneListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'ZE' | 'LEZ'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'upcoming' | 'inactive'>('all');

  const filteredZones = useMemo(() => {
    return zones.filter(zone => {
      const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           zone.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || zone.type === filterType;
      const matchesStatus = filterStatus === 'all' || zone.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [zones, searchTerm, filterType, filterStatus]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Onbekend';
    try {
      return new Date(dateString).toLocaleDateString('nl-NL');
    } catch {
      return 'Onbekend';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actief';
      case 'upcoming': return 'Binnenkort';
      case 'inactive': return 'Inactief';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Emissiezones</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Zoek zones of steden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Alle types</option>
            <option value="ZE">ZE Zones</option>
            <option value="LEZ">LEZ Zones</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Alle status</option>
            <option value="active">Actief</option>
            <option value="upcoming">Binnenkort</option>
            <option value="inactive">Inactief</option>
          </select>
        </div>
      </div>

      {/* Zone List */}
      <div className="flex-1 overflow-y-auto">
        {filteredZones.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Geen zones gevonden
          </div>
        ) : (
          <div className="p-2">
            {filteredZones.map((zone) => (
              <div
                key={zone.id}
                onClick={() => onZoneSelect(zone)}
                className={`p-3 mb-2 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedZone?.id === zone.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Zone Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{zone.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-600">{zone.city}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      zone.type === 'ZE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {zone.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(zone.status)}`}>
                      {getStatusLabel(zone.status)}
                    </span>
                  </div>
                </div>

                {/* Zone Details */}
                <div className="space-y-1">
                  {zone.validFrom && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>Vanaf: {formatDate(zone.validFrom)}</span>
                    </div>
                  )}

                  {zone.restrictions.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <AlertTriangle className="w-3 h-3 text-orange-500" />
                      <span>{zone.restrictions.length} beperkingen</span>
                    </div>
                  )}

                  {zone.exemptions.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Shield className="w-3 h-3 text-green-500" />
                      <span>{zone.exemptions.length} vrijstellingen</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          {filteredZones.length} van {zones.length} zones weergegeven
        </div>
      </div>
    </div>
  );
} 