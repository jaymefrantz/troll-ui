type TrollPolaroidMapMarker = import("../app/types/gmap").PolaroidMapMarker

interface Polaroid {
  id: string
  place?: string
  location: string
  year: number
  month: number
  state?: string
  country: number
}

interface Marker extends TrollPolaroidMapMarker {}

interface Icon {
  name: string
  size?: string
}