import rawData from '@/data/il_ilce_mahalle.json';

const locationsData: Record<string, Record<string, string[]>> = rawData as any;

export function toTurkishTitleCase(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR');
    })
    .join(' ');
}

// Tüm İllerin unvan düzenlenmiş listesini alfabetik getirir
export function getCities(): string[] {
  const keys = Object.keys(locationsData);
  const formatted = keys.map(k => toTurkishTitleCase(k));
  return Array.from(new Set(formatted)).sort((a, b) => a.localeCompare(b, 'tr-TR'));
}

// Seçilen İl için İlçeleri getirir
export function getDistrictsForCity(cityName: string): string[] {
  if (!cityName) return [];
  
  const cityKey = Object.keys(locationsData).find(
    k => k.toLocaleLowerCase('tr-TR') === cityName.trim().toLocaleLowerCase('tr-TR')
  );

  if (!cityKey || !locationsData[cityKey]) return [];

  const districtKeys = Object.keys(locationsData[cityKey]);
  const formatted = districtKeys.map(d => toTurkishTitleCase(d));
  return Array.from(new Set(formatted)).sort((a, b) => a.localeCompare(b, 'tr-TR'));
}

// Seçilen İl ve İlçe için Mahalleleri getirir
export function getNeighborhoodsForDistrict(cityName: string, districtName: string): string[] {
  if (!cityName || !districtName) return [];

  const cityKey = Object.keys(locationsData).find(
    k => k.toLocaleLowerCase('tr-TR') === cityName.trim().toLocaleLowerCase('tr-TR')
  );
  if (!cityKey || !locationsData[cityKey]) return [];

  const districtsObj = locationsData[cityKey];
  const districtKey = Object.keys(districtsObj).find(
    d => d.toLocaleLowerCase('tr-TR') === districtName.trim().toLocaleLowerCase('tr-TR')
  );

  if (!districtKey || !Array.isArray(districtsObj[districtKey])) return [];

  const formatted = districtsObj[districtKey].map(n => toTurkishTitleCase(n));
  return Array.from(new Set(formatted)).sort((a, b) => a.localeCompare(b, 'tr-TR'));
}

// Eski CITIES_DATA uyumluluğu için
export const CITIES_DATA: Record<string, string[]> = {};
getCities().forEach(city => {
  CITIES_DATA[city] = getDistrictsForCity(city);
});
