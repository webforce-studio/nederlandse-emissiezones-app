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
    
    const allZones: EmissionZone[] = [];
    
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
      
      // Find all location conditions with polygons - probeer verschillende methoden
      let locationConditions = trafficRegulation.querySelectorAll('conditions[type="tro:LocationCondition"]');
      console.log(`📍 Found ${locationConditions.length} location conditions for ${cityName}`);
      
      if (locationConditions.length === 0) {
        // Probeer zonder namespace prefix
        locationConditions = trafficRegulation.querySelectorAll('conditions[type="LocationCondition"]');
        console.log(`🔍 Found ${locationConditions.length} LocationCondition (no namespace) for ${cityName}`);
      }
      
      if (locationConditions.length === 0) {
        // Probeer alle conditions die "Location" bevatten
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
      
      // Als we nog steeds geen location conditions hebben, gebruik alle conditions
      if (locationConditions.length === 0) {
        console.log(`⚠️ No location conditions found, using all conditions for ${cityName}`);
        locationConditions = trafficRegulation.querySelectorAll('conditions');
      }
      
      Array.from(locationConditions).forEach((locationCondition, conditionIndex) => {
        console.log(`🗺️ Processing condition ${conditionIndex} for ${cityName}...`);
        
        // Debug location condition structure
        console.log(`🔍 Condition children:`, Array.from(locationCondition.children).map(child => child.tagName));
        
        // Zoek naar polygonen met verschillende selectors
        let polygons = locationCondition.querySelectorAll('gmlPolygon');
        console.log(`📍 Found ${polygons.length} gmlPolygon elements`);
        
        if (polygons.length === 0) {
          // Zoek naar alle elementen die polygon-gerelateerde tag namen hebben
          const allElements = locationCondition.querySelectorAll('*');
          const polygonElements = Array.from(allElements).filter(el => 
            el.tagName.toLowerCase().includes('polygon')
          );
          polygons = polygonElements as any;
          console.log(`📍 Found ${polygons.length} polygon tag elements`);
        }
        
        if (polygons.length === 0) {
          // Zoek naar alle elementen die "polygon" bevatten (case insensitive)
          const allElements = locationCondition.querySelectorAll('*');
          const polygonElements = Array.from(allElements).filter(el => 
            el.tagName.toLowerCase().includes('polygon') || 
            el.getAttribute('type')?.toLowerCase().includes('polygon')
          );
          polygons = polygonElements as any;
          console.log(`📍 Found ${polygons.length} polygon-like elements`);
        }
        
        if (polygons.length === 0) {
          // Als laatste redmiddel, zoek naar posList elementen
          const posLists = locationCondition.querySelectorAll('posList');
          console.log(`📍 Found ${posLists.length} posList elements directly`);
          
          if (posLists.length > 0) {
            // Maak fake polygon objecten voor elke posList
            const fakePolygons = Array.from(posLists).map(posList => {
              const fakePolygon = document.createElement('div');
              fakePolygon.appendChild(posList.cloneNode(true));
              return fakePolygon;
            });
            polygons = fakePolygons as any;
            console.log(`📍 Created ${polygons.length} fake polygons from posList elements`);
          }
        }
        
        Array.from(polygons).forEach((polygon, polygonIndex) => {
          console.log(`🔺 Processing polygon ${polygonIndex} for ${cityName}...`);
          
          // Zoek naar posList op verschillende manieren
          let posListElement = polygon.querySelector('posList');
          
          if (!posListElement) {
            // Probeer directe child als dit een fake polygon is
            posListElement = polygon.querySelector('posList') || 
                            Array.from(polygon.children).find(child => child.tagName === 'posList') as Element;
          }
          
          if (!posListElement) {
            // Zoek in alle descendants
            const allDescendants = polygon.querySelectorAll('*');
            const foundElement = Array.from(allDescendants).find(el => 
              el.tagName.toLowerCase().includes('poslist') || 
              (el.textContent?.trim().split(/\s+/).length || 0) > 10  // Veel getallen = waarschijnlijk coordinaten
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
                // Determine zone type based on name
                const zoneName = polygons.length > 1 ? `${cityName} (Deel ${polygonIndex + 1})` : cityName;
                const zoneType = extractZoneType(cityName);
                
                // Extract validity period
                const validityCondition = trafficRegulation.querySelector('conditions[type="tro:ValidityCondition"]');
                const startTimeElement = validityCondition?.querySelector('overallStartTime');
                const startDate = startTimeElement?.textContent || '';
                
                // Extract URL for more information
                const urlElement = regulation.querySelector('urlForFurtherInformation');
                const infoUrl = urlElement?.textContent || '';
                
                // Extract issuing authority
                const authorityElement = regulation.querySelector('issuingAuthority value[lang="nl"]');
                const authority = authorityElement?.textContent || '';
                
                const zone: EmissionZone = {
                  id: `${regulation.getAttribute('id')}_${polygonIndex}`,
                  name: zoneName,
                  city: authority || extractCity(cityName),
                  type: zoneType,
                  status: determineStatus(startDate),
                  validFrom: startDate,
                  coordinates,
                  restrictions: ['Dieselvoertuigen', 'Oude voertuigen'], // Default restrictions
                  exemptions: ['Elektrische voertuigen', 'Waterstof voertuigen', 'Oldtimers'],
                  url: infoUrl,
                  authority: authority || extractCity(cityName)
                };
                
                console.log(`✅ Successfully processed zone: ${zone.name} (${coordinates.length} coordinates)`);
                allZones.push(zone);
              }
            }
          }
        });
      });
    });
    
    console.log(`🎉 Total zones processed: ${allZones.length}`);
    return allZones;
    
  } catch (error) {
    console.error('❌ Error processing emission zones data:', error);
    throw error;
  }
}