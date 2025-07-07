'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { EmissionZone } from '@/lib/data-processor';

// Component to handle map bounds
function MapController({ zones }: { zones: EmissionZone[] }) {
  const map = useMap();
  
  useEffect(() => {
    console.log('🗺️ MapController: zones changed', zones.length);
    
    if (zones.length > 0) {
      // Calculate bounds from all zone coordinates, handling both single and multi-polygon
      const allCoords: [number, number][] = zones.flatMap(zone => {
        // Check if coordinates are multi-polygon format
        if (Array.isArray(zone.coordinates[0]) && Array.isArray(zone.coordinates[0][0])) {
          // Multi-polygon: flatten all polygons
          return (zone.coordinates as [number, number][][]).flat();
        } else {
          // Single polygon
          return zone.coordinates as [number, number][];
        }
      });
      
      console.log('🗺️ Total coordinates for bounds:', allCoords.length);
      
      if (allCoords.length > 0) {
        const latitudes = allCoords.map(coord => coord[0]);
        const longitudes = allCoords.map(coord => coord[1]);
        
        const bounds = [
          [Math.min(...latitudes), Math.min(...longitudes)],
          [Math.max(...latitudes), Math.max(...longitudes)]
        ] as [[number, number], [number, number]];
        
        console.log('🗺️ Calculated bounds:', bounds);
        
        try {
          map.fitBounds(bounds, { 
            padding: [20, 20],
            maxZoom: 15 
          });
          console.log('✅ Map bounds set successfully');
        } catch (error) {
          console.error('❌ Error setting map bounds:', error);
        }
      }
    } else {
      console.log('🗺️ No zones, setting default view to Netherlands');
      map.setView([52.3676, 4.9041], 7);
    }
  }, [map, zones]);

  return null;
}

interface EmissionZoneMapProps {
  zones: EmissionZone[];
  selectedZone: EmissionZone | null;
  onZoneSelect: (zone: EmissionZone | null) => void;
}

export default function EmissionZoneMap({ zones, selectedZone, onZoneSelect }: EmissionZoneMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-full bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Kaart laden...</div>
      </div>
    );
  }

  const getZoneColor = (zone: EmissionZone) => {
    if (zone.type === 'ZE') return '#7CB342'; // Groen voor Zero Emission
    return '#5B9BD5'; // Blauw voor Low Emission
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Onbekend';
    try {
      return new Date(dateString).toLocaleDateString('nl-NL');
    } catch {
      return 'Onbekend';
    }
  };

  return (
    <div className="w-full h-full">
      <MapContainer
        key="emission-zones-map"
        center={[52.3676, 4.9041]}
        zoom={7}
        style={{ width: '100%', height: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapController zones={zones} />
        
        {zones.map((zone) => {
          console.log(`🗺️ Rendering zone: ${zone.name}`, {
            id: zone.id,
            coordinatesStructure: Array.isArray(zone.coordinates[0]) 
              ? Array.isArray(zone.coordinates[0][0]) 
                ? 'multi-polygon' 
                : 'single-polygon'
              : 'invalid',
            polygonCount: Array.isArray(zone.coordinates[0]) && Array.isArray(zone.coordinates[0][0]) 
              ? zone.coordinates.length 
              : 1,
            totalCoords: Array.isArray(zone.coordinates[0]) && Array.isArray(zone.coordinates[0][0])
              ? (zone.coordinates as [number, number][][]).flat().length
              : (zone.coordinates as [number, number][]).length
          });
          
          if (!zone.coordinates || zone.coordinates.length === 0) {
            console.warn(`⚠️ Zone ${zone.name} has no coordinates - skipping`);
            return null;
          }
          
          // Determine if this is a multi-polygon or single polygon
          const isMultiPolygon = Array.isArray(zone.coordinates[0]) && Array.isArray(zone.coordinates[0][0]);
          const polygonPositions = isMultiPolygon 
            ? (zone.coordinates as [number, number][][])
            : [zone.coordinates as [number, number][]];
          
          // Validate coordinates are properly formatted
          const allCoords = polygonPositions.flat();
          const hasValidCoords = allCoords.every((coord: any) => 
            Array.isArray(coord) && coord.length === 2 && 
            typeof coord[0] === 'number' && typeof coord[1] === 'number'
          );
          
          if (!hasValidCoords) {
            console.error(`❌ Zone ${zone.name} has invalid coordinate format`);
            return null;
          }
          
          const color = getZoneColor(zone);
          const isSelected = selectedZone?.id === zone.id;
          
          return (
            <Polygon
              key={zone.id}
              positions={polygonPositions}
              pathOptions={{
                color: color,
                weight: isSelected ? 3 : 2,
                opacity: isSelected ? 1 : 0.8,
                fillColor: color,
                fillOpacity: isSelected ? 0.4 : 0.2,
              }}
              eventHandlers={{
                click: () => {
                  console.log(`🖱️ Clicked zone: ${zone.name}`);
                  onZoneSelect(zone);
                },
                add: () => {
                  console.log(`✅ Polygon successfully added to map: ${zone.name} (${isMultiPolygon ? 'multi' : 'single'}-polygon)`);
                },
                error: (error) => {
                  console.error(`❌ Error adding polygon ${zone.name}:`, error);
                }
              }}
            >
              <Popup>
                <div className="p-2 min-w-[250px]">
                  <h3 className="font-bold text-lg mb-2">{zone.name}</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>Type:</strong> {zone.type}</div>
                    <div><strong>Stad:</strong> {zone.city}</div>
                    <div><strong>Autoriteit:</strong> {zone.authority}</div>
                    <div><strong>Status:</strong> 
                      <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                        zone.status === 'active' ? 'bg-green-100 text-green-800' :
                        zone.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {zone.status === 'active' ? 'Actief' : 
                         zone.status === 'upcoming' ? 'Binnenkort' : 'Inactief'}
                      </span>
                    </div>
                    {zone.validFrom && (
                      <div><strong>Vanaf:</strong> {formatDate(zone.validFrom)}</div>
                    )}
                    {zone.validTo && (
                      <div><strong>Tot:</strong> {formatDate(zone.validTo)}</div>
                    )}
                    {zone.restrictions.length > 0 && (
                      <div>
                        <strong>Beperkingen:</strong>
                        <div className="text-xs mt-1">
                          {zone.restrictions.join(', ')}
                        </div>
                      </div>
                    )}
                    {zone.exemptions.length > 0 && (
                      <div>
                        <strong>Vrijstellingen:</strong>
                        <div className="text-xs mt-1">
                          {zone.exemptions.slice(0, 3).join(', ')}
                          {zone.exemptions.length > 3 && '...'}
                        </div>
                      </div>
                    )}
                    {zone.url && (
                      <div className="mt-2">
                        <a 
                          href={zone.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs underline"
                        >
                          Meer informatie →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
} 