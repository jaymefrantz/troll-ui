const mapOptions = {
  cameraControl: false,
  overviewMapControl: false,
  // disableDefaultUI: true,
  minZoom: 1,
  maxZoom: 16,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  zoomControl: false,
  center: {
    lat: 41.4993,
    lng: -81.6944,
  },
}

//const mobileBreakpoint = parseInt(cssBreakpoints.map.replace("px", "")) //jlf
const mobileBreakpoint = 0

function parseGmapAddressComponents(components: any[]) {
  return components.reduce((obj: any, component: any) => {
    // Handle both old API format (long_name, short_name) and new API format (longText, shortText)
    const types = component.types
    const long_name = component.longText || component.long_name
    const short_name = component.shortText || component.short_name

    const isCity = types.includes("locality")
    const isCountry = types.includes("country")
    const isState = types.includes("administrative_area_level_1")

    if (isCountry && long_name) {
      obj.country = long_name.trim()
      if (obj.city === undefined) obj.city = obj.state
      if (obj.country !== "United States" && obj.country !== "Canada") obj.state = ""
    }

    if (isCity && long_name) {
      obj.city = long_name.trim()
    }

    if (isState && short_name) {
      obj.state = short_name.trim()
    }

    return obj
  }, {})
}

// Preserve existing imports while the polaroid implementation lives separately.
export {
  getNextLevel,
  getTitle,
  initOverlay,
  initLabelOverlay,
  getZoomedMarkers,
  polaroidMouseOver,
  polaroidMouseOut,
  locationMouseOver,
  locationMouseOut,
} from "./gmap/polaroids"

export { parseGmapAddressComponents, mapOptions, mapStyles, mobileBreakpoint }
