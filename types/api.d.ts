interface Polaroid {
  id: string
  place?: string
  location: string
  year: number
  month: number
  state?: string
  country: number
}

interface Marker {
  id: string
  title: string
  link?: string
  polaroids: string[]
  position: {
    lat: number
    lng: number
  }
  level: string
}