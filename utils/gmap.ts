//import cssBreakpoints from "~/assets/scss/exports/breakpoints.module.scss" //jlf

interface LatLng {
  lat: number
  lng: number
}

interface Preview {
  image: string
  position: LatLng
  clicked: boolean
  hidden: boolean
  $el: HTMLElement
}

interface Polaroid {
  id: string
  image: string
  position: LatLng
  clicked?: boolean
}

const mapOptions = {
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
    lng: -81.6944
  }
}

const zoomLevels = {
  country: 3,
  state: 5,
  polaroid: 9,
  city: 7,
}

function getNextLevel({ level, title }: Marker) {
  if (level === "country") {
    if (title === "United States" || title === "Canada") {
      return "state"
    } else {
      return "city"
    }
  } else if (level === "state") {
    return "city"
  } else if (level === "city") {
    return "polaroid"
  }

  return "polaroid"
}

//const mobileBreakpoint = parseInt(cssBreakpoints.map.replace("px", "")) //jlf
const mobileBreakpoint = 0
function initLabelOverlay(google, map) {
  class LabelOverlay extends google.maps.OverlayView {
    label: string
    position: LatLng
    map: google.maps.Map
    constructor() {
      super()
      this.position = { lat: 0, lng: 0 }
      this.label = ""
      this.map = map
    }
    onAdd() {
      const panes = this.getPanes()
      panes.overlayLayer.style["zIndex"] = 1001

      panes.overlayLayer.insertAdjacentHTML(
        "beforeend",
        `<span id="marker-location-label">${this.label}</span>`
      )
    }
    draw() {
      const gMapPosition = new google.maps.LatLng(this.position)
      this.overlayProjection = this.getProjection()
      const { x, y } = this.overlayProjection.fromLatLngToDivPixel(gMapPosition)
      const marker = document.querySelector("#marker-location-label")
      marker.style.left = `${x}px`
      marker.style.top = `${y}px`
    }
    show({ position, title: label }: Marker) {
      this.position = position
      this.label = label
      this.setMap(this.map)
    }
    hide() {
      this.setMap(null)
    }
    onRemove() {

      const div = document.getElementById("marker-location-label")
      console.log("removing", div, this.label)
      div.parentNode.removeChild(div)
    }
  }

  return LabelOverlay
}

function initOverlay(google, map) {
  class Overlay extends google.maps.OverlayView {
    label: string
    position: LatLng
    $el: HTMLElement | null
    previews: Record<string, Preview>
    map: google.maps.Map
    polaroidMaxZoom: number
    overlayProjection
    constructor() {
      super()
      this.position = { lat: 0, lng: 0 }
      this.label = ""
      this.$el = null
      this.previews = {}
      this.map = map
      this.polaroidMaxZoom = zoomLevels.polaroid
    }
    onAdd() {
      const panes = this.getPanes()
      panes.overlayLayer.style["zIndex"] = 1001
      panes.overlayLayer.insertAdjacentHTML("beforeend", `<span id="marker-location-label"></span>`)
      this.$el = document.getElementById("marker-location-label")
      this.overlayProjection = this.getProjection()
    }
    draw() {
      if (this.label !== "") {
        const gMapPosition = new google.maps.LatLng(this.position)

        const overlayProjection = this.getProjection()
        const { x, y } = overlayProjection.fromLatLngToDivPixel(gMapPosition)
        // console.log("draw?", this.label)

        this.$el.style.left = `${x}px`
        this.$el.style.top = `${y}px`
        this.$el.innerText = this.label
      }

      Object.entries(this.previews).forEach(([id, preview]) => {
        if (!preview.hidden) {
          this.positionPreview(id, preview.position)
        } else {
          //preview.$el.classList.remove("shown")
          this.hidePreview(preview.$el)
          //here
        }
      })
    }
    showLabel({ position, title }: Marker) {
      this.position = position
      this.label = title

      const gMapPosition = new google.maps.LatLng(this.position)
      const { x, y } = this.overlayProjection.fromLatLngToDivPixel(gMapPosition)

      this.$el.style.left = `${x}px`
      this.$el.style.top = `${y}px`

      setTimeout(() => {
        this.$el.innerText = this.label
        this.$el.classList.add("shown")
      }, 25)
    }
    hideLabel({ title }: Marker) {
      //need to know if a marker is currently being hovered? 
      setTimeout(() => {
        if (this.label === title) {
          this.$el.classList.remove("shown")
          this.label = ""
        }
      }, 25)

    }
    polaroidClicked(id: string) {
      this.previews[id].clicked = true
    }
    addPolaroid(polaroid: Polaroid, clicked = false) {
      const { image, position, id } = polaroid
      //console.log("add", this.previews[id])

      if (this.previews[id] === undefined) {
        const panes = this.getPanes()
        const imageUrl = JSON.parse(JSON.stringify(useRuntimeConfig().public.CLOUDINARY)).split("/")
        const environment = imageUrl.pop()
        panes.floatPane.insertAdjacentHTML("beforeend",
          `<div class="marker-preview-container" id="preview-${id}"><div class="marker-preview">
              <button type="button" class="close-preview-button"></button>
              <div class="marker-preview-image-wrap">
                <img src="${`${imageUrl.join("/")}/w_228,h_202,f_auto,dpr_auto/${environment}/polaroids/${id}.jpg`}" width="128" height="102">
              </div>
            </div></div>`
        )

        const $el = document.getElementById(`preview-${id}`)

        $el?.querySelector(".close-preview-button")?.addEventListener("click", (event) => {
          this.previews[id].clicked = false
          this.removePreview(id)
        })

        this.previews[id] = { image, position, clicked, hidden: false, $el }
      } else {
        // console.log("update", this.previews[id])
        this.previews[id].hidden = false
        this.previews[id].$el.classList.add("shown")
      }

      this.positionPreview(id)
    }
    removePreview(id: string, hardRemove = false) {
      //, hardRemove = false
      //hard remove should be used on like after filters?

      if (!this.previews[id].clicked || hardRemove) {
        //setTimeout(() => {
        this.previews[id].hidden = true
        // this.previews[id].$el.classList.remove("shown")
        this.hidePreview(this.previews[id].$el)
        //here
        //}, 50)
      }
    }
    positionPreview(id: string) {
      const { position, $el } = this.previews[id]
      const gMapPosition = new google.maps.LatLng(position)
      const overlayProjection = this.getProjection()
      const { x, y } = overlayProjection.fromLatLngToDivPixel(gMapPosition)
      $el.style.left = `${x}px`
      $el.style.top = `${y}px`

      if (this.map.zoom >= this.polaroidMaxZoom) {
        //setTimeout(() => {
        $el.classList.add("shown")
        //}, 50)
      } else {
        // $el.classList.remove("shown")
        this.hidePreview($el)
        this.previews[id].hidden = true
      }
    }
    hidePreview($el: HTMLElement) {
      $el.classList.add("leave")
      $el.classList.remove("shown")

      //setTimeout(() => {
      $el.classList.remove("leave")
      //}, 100)
    }
    onRemove() {
    }
  }

  const overlay = new Overlay()
  overlay.setMap(map)
  return overlay
}

function getTitle({ level, polaroids }: Marker) {
  let size = "14px"
  let polaroidCount = polaroids.length
  //let markerPolaroids = marker.polaroids.filter(id => this.filteredPolaroids.includes(id))

  if (polaroidCount >= 100) {
    size = "10px"
  } else if (polaroidCount >= 10) {
    size = "12px"
  }

  if (level !== "polaroid") {
    return { label: { text: polaroidCount.toString(), fontSize: size, fontWeight: "bold", color: "#6d6f73" } }
  } else {
    return {} //hopefully this is ok
  }
}

function getZoomedMarkers(level: string, markers: Marker[]) {
  return markers.filter(({ level: markerLabel, title }) => {
    let zoomLevelMatch = markerLabel === level
    if (level === "state") {
      if (markerLabel !== "state" && title !== "United States" && title !== "Canada") {
        zoomLevelMatch = markerLabel === "country"
      }
    }
    return zoomLevelMatch
  })
}

export { mapOptions, mapStyles, mobileBreakpoint, zoomLevels, getNextLevel, getTitle, initOverlay, initLabelOverlay, getZoomedMarkers }

