export interface MapPosition {
  lat: number
  lng: number
}

/** Data shared by map markers, independent of the polaroid hierarchy. */
export interface MapMarker {
  id: string
  title?: string
  link?: string
  position: MapPosition
  icon?: string
  hoverIcon?: string
  label?: number | string
  color?: string
  iconOptions?: Partial<google.maps.Icon>
  options?: google.maps.MarkerOptions
  image?: string
  /** Optional compatibility fields for the location/polaroid hierarchy. */
  level?: string
  polaroids?: string[]
}

/** The existing location/polaroid marker structure. */
export interface PolaroidMapMarker extends MapMarker {
  title: string
  polaroids: string[]
  level: string
}

export type MapMarkerEventName = "markerClick" | "markerMouseOver" | "markerMouseOut" | "markerDragend"

export interface MapMarkerEvent extends MapMarker {
  gmapMarker: { marker?: google.maps.Marker } | null
  newPosition?: MapPosition
}

/** Image and location passed to the existing overlay's addPolaroid method. */
export interface PolaroidOverlayItem {
  id: string
  image: string
  position: MapPosition
  clicked?: boolean
}

export interface PolaroidOverlayPreview {
  image: string
  position: MapPosition
  clicked: boolean
  hidden: boolean
  $el: HTMLElement
}

/** Vue-managed previews have no retained DOM reference after they are closed. */
export interface PolaroidPreviewState extends PolaroidOverlayItem {
  clicked: boolean
  closing: boolean
}

export interface PolaroidOverlayController {
  showLabel(marker: Pick<MapMarker, "title" | "position">): void
  hideLabel(marker: Pick<MapMarker, "title">): void
  addPolaroid(item: PolaroidOverlayItem, clicked?: boolean): void
  polaroidClicked(id: string): void
  showPreview(id: string): void
  removePreview(id: string, hardRemove?: boolean): Promise<void>
  removeAllPreviews(): void
  previews: import("vue").Ref<Record<string, PolaroidPreviewState>>
}
