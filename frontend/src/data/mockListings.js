const featurePool = [
  'Air conditioning', 'Rear camera', 'Bluetooth', 'Cruise control',
  'Parking sensors', 'ABS', '6 airbags', 'Apple CarPlay',
  'Leather seats', 'Sunroof', 'Keyless entry', 'Lane assist',
  'Heated seats', 'Alloy wheels',
];

const communes = {
  Alger: 'Hydra', Oran: 'Bir El Djir', Constantine: 'El Khroub',
  'Sétif': 'El Eulma', Annaba: 'El Bouni', Blida: 'Boufarik',
  'Béjaïa': 'Akbou', Tlemcen: 'Mansourah', Batna: 'Barika',
  'Tizi Ouzou': 'Azazga',
};

const trims = {
  'Golf 8': '1.5 TSI', Tucson: '1.6 CRDi', 'Clio 5': '1.0 TCe',
  Octavia: '2.0 TDI', Hilux: '2.4 D-4D',
};

const photos = [
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=85',
];

export const sellers = [
  { id: 's1', name: 'Karim B.', avatar: 'https://i.pravatar.cc/160?img=11', isVerified: true, memberSince: '2021-04-12' },
  { id: 's2', name: 'Amina R.', avatar: 'https://i.pravatar.cc/160?img=47', isVerified: true, memberSince: '2022-08-03' },
  { id: 's3', name: 'Yacine M.', avatar: 'https://i.pravatar.cc/160?img=12', isVerified: false, memberSince: '2025-01-17' },
  { id: 's4', name: 'Auto Prestige Oran', avatar: 'https://i.pravatar.cc/160?img=5', isVerified: true, memberSince: '2019-05-20' },
  { id: 's5', name: 'Sofiane K.', avatar: 'https://i.pravatar.cc/160?img=14', isVerified: true, memberSince: '2023-02-08' },
  { id: 's6', name: 'Lina H.', avatar: 'https://i.pravatar.cc/160?img=32', isVerified: true, memberSince: '2022-11-30' },
  { id: 's7', name: 'Rachid T.', avatar: 'https://i.pravatar.cc/160?img=15', isVerified: false, memberSince: '2025-06-02' },
];

const karimListingIndexes = [0, 3, 6, 9, 12, 18, 24, 30, 36];
const otherSellers = [sellers[1], sellers[3], sellers[4], sellers[5], sellers[6]];

const cars = [
  ['Volkswagen','Golf 8',2021,48000,3450000,'diesel','automatic','hatchback','Alger'],
  ['Hyundai','Tucson',2023,22000,5980000,'diesel','automatic','suv','Oran'],
  ['Renault','Clio 5',2022,38000,2890000,'petrol','manual','hatchback','Constantine'],
  ['Peugeot','208',2021,61000,3150000,'petrol','automatic','hatchback','Sétif'],
  ['Toyota','Hilux',2020,87000,7200000,'diesel','manual','truck','Annaba'],
  ['Kia','Sportage',2024,9000,6850000,'hybrid','automatic','suv','Blida'],
  ['Seat','Ibiza',2019,96000,2450000,'petrol','manual','hatchback','Béjaïa'],
  ['Dacia','Duster',2022,44000,4100000,'diesel','manual','suv','Tlemcen'],
  ['Skoda','Octavia',2020,72000,3950000,'diesel','automatic','sedan','Alger'],
  ['Toyota','Corolla Hybrid',2023,18000,6100000,'hybrid','automatic','sedan','Oran'],
  ['Chery','Tiggo 7',2024,6000,5250000,'petrol','automatic','suv','Constantine'],
  ['BYD','Atto 3',2025,0,9500000,'electric','automatic','suv','Alger'],
  ['Volkswagen','Golf 8',2022,34000,3750000,'diesel','automatic','hatchback','Blida'],
  ['Hyundai','Tucson',2022,52000,5500000,'diesel','automatic','suv','Annaba'],
  ['Renault','Clio 5',2020,68000,2550000,'petrol','manual','hatchback','Sétif'],
  ['Toyota','Hilux',2021,79000,7550000,'diesel','manual','truck','Oran'],
  ['Peugeot','3008',2022,41000,5900000,'diesel','automatic','suv','Batna'],
  ['Renault','Mégane',2018,112000,2780000,'diesel','manual','sedan','Tizi Ouzou'],
  ['Volkswagen','T-Roc',2024,12000,8100000,'petrol','automatic','suv','Alger'],
  ['Fiat','Tipo',2023,26000,3650000,'petrol','manual','sedan','Blida'],
  ['Mercedes-Benz','C-Class',2019,78000,9200000,'diesel','automatic','sedan','Oran'],
  ['Audi','A3',2020,63000,7900000,'petrol','automatic','sedan','Alger'],
  ['Ford','Ranger',2022,56000,8700000,'diesel','automatic','truck','Sétif'],
  ['Suzuki','Swift',2021,47000,2480000,'petrol','manual','hatchback','Annaba'],
  ['Nissan','Qashqai',2020,69000,4700000,'diesel','automatic','suv','Béjaïa'],
  ['Geely','Coolray',2024,5000,4950000,'petrol','automatic','suv','Constantine'],
  ['Kia','Picanto',2019,81000,2250000,'petrol','manual','hatchback','Tlemcen'],
  ['Toyota','Yaris',2023,19000,4380000,'hybrid','automatic','hatchback','Alger'],
  ['Dacia','Logan',2017,146000,1850000,'petrol','manual','sedan','Batna'],
  ['Peugeot','Partner',2020,99000,3350000,'diesel','manual','van','Oran'],
  ['Renault','Kangoo',2021,76000,3600000,'diesel','manual','van','Blida'],
  ['Volkswagen','Passat',2018,124000,4200000,'diesel','automatic','sedan','Tizi Ouzou'],
  ['Hyundai','i20',2022,33000,3200000,'petrol','automatic','hatchback','Sétif'],
  ['Kia','Rio',2020,71000,2900000,'petrol','manual','sedan','Annaba'],
  ['Skoda','Kodiaq',2023,24000,8450000,'diesel','automatic','suv','Alger'],
  ['Renault','Captur',2022,39000,4550000,'petrol','automatic','suv','Béjaïa'],
  ['Peugeot','2008',2024,8000,5350000,'electric','automatic','suv','Oran'],
  ['Fiat','500',2021,44000,3050000,'hybrid','automatic','hatchback','Constantine'],
  ['Toyota','Land Cruiser',2020,89000,9400000,'diesel','automatic','suv','Tlemcen'],
  ['BMW','2 Series',2019,74000,8850000,'petrol','automatic','coupe','Alger'],
];

const seedListings = cars.map((car, index) => {
  const [make, model, year, mileage, price, fuelType, transmission, bodyType, location] = car;
  const type = index < 26 ? 'sale' : 'rent';
  const daily = 4000 + (index % 8) * 1500;
  return {
    id: `car-${index + 1}`,
    title: `${year} ${make} ${model}`,
    type,
    make,
    model,
    year,
    mileage,
    price,
    rentalPrice: { daily, weekly: daily * 6, monthly: daily * 24 },
    fuelType,
    transmission,
    bodyType,
    color: ['White','Black','Gray','Silver','Blue','Red','Beige','Green'][index % 8],
    images: Array.from({ length: 6 + (index % 5) }, (_, photo) => photos[(index + photo * 3) % photos.length]),
    location,
    status: [3,17,24].includes(index) ? 'sold' : [29,36].includes(index) ? 'rented' : 'active',
    createdAt: new Date(Date.now() - index * 31 * 60 * 60 * 1000).toISOString(),
    seller: karimListingIndexes.includes(index) ? sellers[0] : index === 2 ? sellers[2] : otherSellers[index % otherSellers.length],
    trim: trims[model],
    description: `This ${year} ${make} ${model} has covered ${mileage.toLocaleString('fr-FR')} km and has been maintained with a full service history. The ${fuelType} engine pairs with a smooth ${transmission} gearbox, making it comfortable both in the city and on long journeys. The interior is clean, non-smoking and well looked after, with no warning lights on the dashboard. All papers, including the carte grise, are in order and ready for inspection. Viewings are welcome in ${location} by appointment through 33-AutoHub messages.`,
    features: featurePool.slice(0, 8 + (index % 7)),
    views: Math.max(180, 1248 - index * 29),
    inquiries: Math.max(2, 14 - (index % 9)),
    saves: Math.max(4, 37 - (index % 11) * 3),
    negotiable: index % 3 === 0,
    commune: communes[location] ?? 'Centre',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    rentalConditions: type === 'rent' ? {
      minimumDuration: index % 2 ? '3 days' : '2 days',
      deposit: 30000 + (index % 4) * 10000,
      minDriverAge: 25,
      licenseYears: 2,
    } : undefined,
  };
});

const OVERRIDES_KEY = 'autohub:listingOverrides';

function readOverrides() {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { status: {}, deleted: [] };
}

function writeOverrides(overrides) {
  try { localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides)); } catch { /* ignore */ }
}

const overrides = readOverrides();
seedListings.forEach((listing) => {
  if (overrides.status[listing.id]) listing.status = overrides.status[listing.id];
});

export const mockListings = seedListings.filter((listing) => !overrides.deleted.includes(listing.id));

export function updateListingStatus(id, status) {
  const listing = seedListings.find((item) => item.id === id);
  if (!listing) return;
  listing.status = status;
  overrides.status[id] = status;
  writeOverrides(overrides);
}

export function removeListing(id) {
  const index = mockListings.findIndex((item) => item.id === id);
  if (index >= 0) mockListings.splice(index, 1);
  if (!overrides.deleted.includes(id)) overrides.deleted.push(id);
  writeOverrides(overrides);
}

export function restoreListing(id) {
  overrides.deleted = overrides.deleted.filter((item) => item !== id);
  writeOverrides(overrides);
  if (mockListings.some((item) => item.id === id)) return;
  const listing = seedListings.find((item) => item.id === id);
  if (!listing) return;
  mockListings.push(listing);
  mockListings.sort((a, b) => seedListings.indexOf(a) - seedListings.indexOf(b));
}

