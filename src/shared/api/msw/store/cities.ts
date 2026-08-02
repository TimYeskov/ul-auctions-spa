export type City = {
  name: string
  gcId: number
}

/** Мок-словарь городов для load_city / unload_city. */
export const CITIES: City[] = [
  { name: 'Пермь', gcId: 59 },
  { name: 'Москва', gcId: 100 },
  { name: 'Казань', gcId: 16 },
  { name: 'Екатеринбург', gcId: 66 },
  { name: 'Новосибирск', gcId: 54 },
  { name: 'Самара', gcId: 63 },
  { name: 'Санкт-Петербург', gcId: 78 },
]

export function findCityByName(name: string) {
  const normalized = name.trim().toLowerCase()
  return CITIES.find((city) => city.name.toLowerCase() === normalized)
}
