import { XMLParser } from 'fast-xml-parser';

export interface EmissionZone {
  id: string;
  name: string;
  type: 'ZE' | 'LEZ';
  city: string;
  authority: string;
  status: 'active' | 'upcoming' | 'inactive';
  validFrom?: string;
  validTo?: string;
  coordinates: [number, number][];
  url?: string;
  restrictions: string[];
  exemptions: string[];
}

function parseCoordinates(posListString: string): [number, number][] {
  if (!posListString) return [];
  
  const coords = posListString.trim().split(/\s+/);
  const coordinates: [number, number][] = [];
  
  console.log(`🔍 Raw coordinate string length: ${posListString.length}`);
  console.log(`🔍 Split into ${coords.length} values, expecting ${coords.length / 2} coordinate pairs`);
  
  for (let i = 0; i < coords.length; i += 2) {
    const lat = parseFloat(coords[i]);
    const lng = parseFloat(coords[i + 1]);
    
    console.log(`🔍 Testing coordinate pair: [${lat}, ${lng}]`);
    
    // Controleer of het Nederlandse coordinaten zijn
    // Mogelijk zijn de coordinaten in lng,lat format in plaats van lat,lng
    const isValidLatLng = (lat >= 50.5 && lat <= 53.7 && lng >= 3.2 && lng <= 7.3);
    const isValidLngLat = (lng >= 50.5 && lng <= 53.7 && lat >= 3.2 && lat <= 7.3);
    
    if (isValidLatLng) {
      // Coordinaten zijn al in lat,lng format
      coordinates.push([lat, lng]);
      console.log(`✅ Valid lat,lng coordinate: [${lat}, ${lng}]`);
    } else if (isValidLngLat) {
      // Coordinaten zijn in lng,lat format - wissel ze om
      coordinates.push([lng, lat]);
      console.log(`✅ Valid lng,lat coordinate (swapped): [${lng}, ${lat}]`);
    } else {
      console.warn(`⚠️ Invalid coordinate for Netherlands: [${lat}, ${lng}] (neither lat,lng nor lng,lat format valid)`);
    }
  }
  
  console.log(`✅ Final result: ${coordinates.length} valid coordinates from ${coords.length / 2} total pairs`);
  return coordinates;
}

function extractZoneType(name: string): 'ZE' | 'LEZ' {
  const nameUpper = name.toUpperCase();
  if (nameUpper.includes('ZE ') || nameUpper.includes('ZERO') || nameUpper.includes('NUL-EMISSIE')) {
    return 'ZE';
  }
  return 'LEZ';
}

function extractCity(name: string): string {
  // Extract city name from zone name
  const patterns = [
    /ZE\s+(\w+)/i,
    /LEZ\s+(\w+)/i,
    /(\w+)\s+ZE/i,
    /(\w+)\s+LEZ/i,
    /(\w+)\s+\d{4}/,
  ];
  
  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Fallback: neem het eerste woord
  const firstWord = name.split(' ')[0];
  return firstWord || 'Onbekend';
}

function determineStatus(validFrom?: string, validTo?: string): 'active' | 'upcoming' | 'inactive' {
  const now = new Date();
  
  if (validFrom) {
    const startDate = new Date(validFrom);
    if (startDate > now) {
      return 'upcoming';
    }
  }
  
  if (validTo) {
    const endDate = new Date(validTo);
    if (endDate < now) {
      return 'inactive';
    }
  }
  
  return 'active';
}

function extractVehicleRestrictions(regulation: any): string[] {
  const restrictions: string[] = [];
  
  try {
    // Navigate through the condition structure
    const conditions = regulation['tro:condition'];
    if (!Array.isArray(conditions)) return restrictions;
    
    conditions.forEach(condition => {
      const subConditions = condition['tro:conditions'];
      if (!Array.isArray(subConditions)) return;
      
      subConditions.forEach(subCondition => {
        const vehicleChars = subCondition['tro:vehicleCharacteristics'];
        if (!vehicleChars) return;
        
        // Extract EU vehicle category
        const extended = vehicleChars['com:_vehicleCharacteristicsExtension']?.['com:vehicleCharacteristicsExtended'];
        if (extended?.['comx:regulatedCharacteristics']?.['comx:euVehicleCategory']) {
          restrictions.push(`EU Voertuig Categorie: ${extended['comx:regulatedCharacteristics']['comx:euVehicleCategory']}`);
        }
        
        // Extract emissions info
        const emissions = vehicleChars['com:emissions'];
        if (emissions?.['com:emissionClassificationEuro']) {
          restrictions.push(`Euro Emissie Norm: ${emissions['com:emissionClassificationEuro']}`);
        }
        
        // Extract fuel type
        const fuelType = vehicleChars['com:fuelType'];
        if (fuelType) {
          restrictions.push(`Brandstof Type: ${fuelType}`);
        }
      });
    });
  } catch (error) {
    console.log('Error extracting restrictions:', error);
  }
  
  return Array.from(new Set(restrictions)); // Remove duplicates
}

function extractExemptions(regulation: any): string[] {
  const exemptions: string[] = [];
  
  try {
    // Look for negated conditions (exemptions)
    const conditions = regulation['tro:condition'];
    if (!Array.isArray(conditions)) return exemptions;
    
    conditions.forEach(condition => {
      if (condition['tro:negate'] === true) {
        const subConditions = condition['tro:conditions'];
        if (!Array.isArray(subConditions)) return;
        
        subConditions.forEach(subCondition => {
          const vehicleChars = subCondition['tro:vehicleCharacteristics'];
          if (!vehicleChars) return;
          
          // Extract exemptions for special purpose vehicles
          const extended = vehicleChars['com:_vehicleCharacteristicsExtension']?.['com:vehicleCharacteristicsExtended'];
          if (extended?.['comx:regulatedCharacteristics']?.['comx:euSpecialPurposeVehicle']) {
            exemptions.push(`Speciale Voertuigen: ${extended['comx:regulatedCharacteristics']['comx:euSpecialPurposeVehicle']}`);
          }
          
          // Extract owner characteristics
          if (extended?.['comx:ownerCharacteristic']?.['comx:ownerType']) {
            exemptions.push(`Eigenaar Type: ${extended['comx:ownerCharacteristic']['comx:ownerType']}`);
          }
          
          // Extract age characteristics
          if (extended?.['comx:ageCharacteristic']) {
            const ageChar = extended['comx:ageCharacteristic'];
            const operator = ageChar['comx:comparisonOperator'];
            const age = ageChar['comx:vehicleAge'];
            if (operator && age) {
              exemptions.push(`Voertuig Leeftijd: ${operator} ${age} jaar`);
            }
          }
          
          // Extract fuel type exemptions
          const fuelType = vehicleChars['com:fuelType'];
          if (fuelType) {
            exemptions.push(`Brandstof Type: ${fuelType}`);
          }
        });
      }
    });
  } catch (error) {
    console.log('Error extracting exemptions:', error);
  }
  
  return Array.from(new Set(exemptions)); // Remove duplicates
}

export async function processEmissionZonesData(): Promise<EmissionZone[]> {
  try {
    const response = await fetch('/data/emission-zones.xml');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlText = await response.text();
    console.log('📄 XML Content Length:', xmlText.length);
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.error('❌ XML parsing error:', parseError.textContent);
      throw new Error('Failed to parse XML: ' + parseError.textContent);
    }

    // Find all urbanVehicleAccessRegulation elements
    const regulations = xmlDoc.querySelectorAll('urbanVehicleAccessRegulation');
    console.log(`🏙️ Found ${regulations.length} emission zones`);
    
    // Tijdelijke structuur om polygonen per stad te verzamelen
    const cityPolygons: Map<string, {
      id: string;
      cityName: string;
      zoneType: 'ZE' | 'LEZ';
      startDate: string;
      infoUrl: string;
      authority: string;
      coordinates: [number, number][][]; // Array van polygon coordinate arrays
    }> = new Map();
    
    // Process each regulation
    regulations.forEach((regulation, index) => {
      const nameElement = regulation.querySelector('name value[lang="nl"]');
      const cityName = nameElement?.textContent || `Onbekende Stad ${index + 1}`;
      
      console.log(`🏛️ Processing zone: ${cityName}`);
      
      // Find traffic regulation
      const trafficRegulation = regulation.querySelector('trafficRegulation');
      if (!trafficRegulation) {
        console.warn(`⚠️ No traffic regulation found for ${cityName}`);
        return;
      }
      
      // Extract gemeenschappelijke metadata
      const zoneType = extractZoneType(cityName);
      const validityCondition = trafficRegulation.querySelector('conditions[type="tro:ValidityCondition"]');
      const startTimeElement = validityCondition?.querySelector('overallStartTime');
      const startDate = startTimeElement?.textContent || '';
      const urlElement = regulation.querySelector('urlForFurtherInformation');
      const infoUrl = urlElement?.textContent || '';
      const authorityElement = regulation.querySelector('issuingAuthority value[lang="nl"]');
      const authority = authorityElement?.textContent || '';
      
      // Find all location conditions with polygons
      let locationConditions = trafficRegulation.querySelectorAll('conditions[type="tro:LocationCondition"]');
      console.log(`📍 Found ${locationConditions.length} location conditions for ${cityName}`);
      
      if (locationConditions.length === 0) {
        locationConditions = trafficRegulation.querySelectorAll('conditions[type="LocationCondition"]');
        console.log(`🔍 Found ${locationConditions.length} LocationCondition (no namespace) for ${cityName}`);
      }
      
      if (locationConditions.length === 0) {
        const allConditions = trafficRegulation.querySelectorAll('conditions');
        console.log(`🔍 Found ${allConditions.length} total conditions for ${cityName}`);
        
        const filteredConditions = Array.from(allConditions).filter(condition => {
          const type = condition.getAttribute('type');
          console.log(`  Condition type: "${type}"`);
          return type && type.includes('Location');
        });
        
        locationConditions = filteredConditions as any;
        console.log(`🔍 Found ${locationConditions.length} filtered location conditions`);
      }
      
      if (locationConditions.length === 0) {
        console.log(`⚠️ No location conditions found, using all conditions for ${cityName}`);
        locationConditions = trafficRegulation.querySelectorAll('conditions');
      }
      
      // Initialiseer stad data als het nog niet bestaat
      if (!cityPolygons.has(cityName)) {
        cityPolygons.set(cityName, {
          id: regulation.getAttribute('id') || `zone_${index}`,
          cityName,
          zoneType,
          startDate,
          infoUrl,
          authority,
          coordinates: []
        });
      }
      
      const cityData = cityPolygons.get(cityName)!;
      
      // Verzamel alle polygonen voor deze stad
      Array.from(locationConditions).forEach((locationCondition, conditionIndex) => {
        console.log(`🗺️ Processing condition ${conditionIndex} for ${cityName}...`);
        
        // Debug location condition structure
        console.log(`🔍 Condition children:`, Array.from(locationCondition.children).map(child => child.tagName));
        
        // Zoek naar polygonen met verschillende selectors
        let polygons = locationCondition.querySelectorAll('gmlPolygon');
        console.log(`📍 Found ${polygons.length} gmlPolygon elements`);
        
        if (polygons.length === 0) {
          const allElements = locationCondition.querySelectorAll('*');
          const polygonElements = Array.from(allElements).filter(el => 
            el.tagName.toLowerCase().includes('polygon')
          );
          polygons = polygonElements as any;
          console.log(`📍 Found ${polygons.length} polygon tag elements`);
        }
        
        if (polygons.length === 0) {
          const allElements = locationCondition.querySelectorAll('*');
          const polygonElements = Array.from(allElements).filter(el => 
            el.tagName.toLowerCase().includes('polygon') || 
            el.getAttribute('type')?.toLowerCase().includes('polygon')
          );
          polygons = polygonElements as any;
          console.log(`📍 Found ${polygons.length} polygon-like elements`);
        }
        
        if (polygons.length === 0) {
          const posLists = locationCondition.querySelectorAll('posList');
          console.log(`📍 Found ${posLists.length} posList elements directly`);
          
          if (posLists.length > 0) {
            const fakePolygons = Array.from(posLists).map(posList => {
              const fakePolygon = document.createElement('div');
              fakePolygon.appendChild(posList.cloneNode(true));
              return fakePolygon;
            });
            polygons = fakePolygons as any;
            console.log(`📍 Created ${polygons.length} fake polygons from posList elements`);
          }
        }
        
        // Verwerk elke polygon en voeg coordinaten toe aan de stad
        Array.from(polygons).forEach((polygon, polygonIndex) => {
          console.log(`🔺 Processing polygon ${polygonIndex} for ${cityName}...`);
          
          let posListElement = polygon.querySelector('posList');
          
          if (!posListElement) {
            posListElement = polygon.querySelector('posList') || 
                            Array.from(polygon.children).find(child => child.tagName === 'posList') as Element;
          }
          
          if (!posListElement) {
            const allDescendants = polygon.querySelectorAll('*');
            const foundElement = Array.from(allDescendants).find(el => 
              el.tagName.toLowerCase().includes('poslist') || 
              (el.textContent?.trim().split(/\s+/).length || 0) > 10
            );
            posListElement = foundElement || null;
          }
          
          console.log(`🔍 Found posList element:`, !!posListElement);
          
          if (posListElement) {
            const posListString = posListElement.textContent?.trim();
            console.log(`📊 PosList content length: ${posListString?.length}, first 100 chars: "${posListString?.substring(0, 100)}..."`);
            
            if (posListString && posListString.length > 0) {
              const coordinates = parseCoordinates(posListString);
              console.log(`📍 Parsed ${coordinates.length} coordinates for ${cityName} polygon ${polygonIndex}`);
              
              if (coordinates.length > 0) {
                // Voeg deze polygon coordinaten toe aan de stad
                cityData.coordinates.push(coordinates);
                console.log(`✅ Added polygon with ${coordinates.length} coordinates to ${cityName}`);
              }
            }
          }
        });
      });
    });
    
    // Converteer de verzamelde data naar EmissionZone objecten
    const allZones: EmissionZone[] = [];
    
    cityPolygons.forEach((cityData, cityName) => {
      if (cityData.coordinates.length > 0) {
        // Combineer alle polygon coordinaten in één grote array
        const allCoordinates: [number, number][] = cityData.coordinates.flat();
        
        const zone: EmissionZone = {
          id: cityData.id,
          name: cityName,
          city: cityData.authority || extractCity(cityName),
          type: cityData.zoneType,
          status: determineStatus(cityData.startDate),
          validFrom: cityData.startDate,
          coordinates: allCoordinates,
          restrictions: ['Dieselvoertuigen', 'Oude voertuigen'],
          exemptions: ['Elektrische voertuigen', 'Waterstof voertuigen', 'Oldtimers'],
          url: cityData.infoUrl,
          authority: cityData.authority || extractCity(cityName)
        };
        
        console.log(`🏛️ Created combined zone: ${zone.name} with ${cityData.coordinates.length} polygons and ${allCoordinates.length} total coordinates`);
        allZones.push(zone);
      }
    });
    
    console.log(`🎉 Total combined zones processed: ${allZones.length}`);
    return allZones;
    
  } catch (error) {
    console.error('❌ Error processing emission zones data:', error);
    throw error;
  }
}