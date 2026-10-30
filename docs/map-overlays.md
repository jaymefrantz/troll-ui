# Map overlay checkpoints

## Step 1: verify the extraction

Run `npm run dev` from the layer and open `http://localhost:5000/dev/map`.
The existing demo uses its configured polaroid API and Google Maps key. Check location
labels, image previews, click-to-pin, close buttons, and pan/zoom. They should behave
as before; this step only moved the implementation and shared types.

## Step 2: try Vue content inside an OverlayView

Open `http://localhost:5000/dev/map-overlay` with the dev server running and a valid
`GMAPS_KEY` configured for the playground. This demo uses two local markers and does
not fetch polaroid data. It uses `GoogleMap` directly; the existing `TrollMap` is not
changed at this checkpoint.

1. Before hovering, confirm **Overlay content mounted: no**.
2. Hover each marker. Its card should appear and disappear on mouseout.
3. Click a marker, or **Open first marker**, to keep its card open. Click its counter:
   Vue should update the text without dragging or clicking through to the map.
4. Drag the map in both directions, then use **Pan map** and **Zoom in**. The card
   should follow the selected marker during movement and after release.
   Also start a drag 30 pixels below the marker: the map should receive it, with no
   text selection or invisible overlay area blocking the gesture.
5. With the first card open, use **Move first marker**, then **Resize map**. Its anchor
   should still follow the marker, and the mounted status should remain **yes**.
6. **Close overlay** should return the mounted status to **no**. Reopen it, then
   **Unmount map**: the status should return to **no** again. Remounting restores the
   selected card without leaving a duplicate behind.

### Reusable component

`TrollMapOverlay` takes a Google map instance, its Maps API namespace, a geographic
position, and `open` (defaults to `false`). It renders its default Vue slot only
while attached to the map. Google positions it through `OverlayView.draw()`;
there are no extra bounds/drag/idle listeners. Closing or unmounting detaches the
overlay and unmounts its slot content.

```vue
<TrollMapOverlay
  :map="gmap?.map"
  :api="gmap?.api"
  :position="selected.position"
  :open="showCard"
  :offset-y="-42"
>
  <MyCard :item="selected" @close="showCard = false" />
</TrollMapOverlay>
```

Use `anchor="bottom-center"` (default), `"center"`, or `"top-left"` and pixel offsets
to align the content. `z-index` controls stacking within Google's `floatPane`.
Content may change size without manual resize calculations: the anchor uses CSS
percentage transforms. The API namespace can be omitted when the map uses the
global `window.google.maps` API.

### Automated check

Run `node --test tests/map-overlay.test.mjs`. These tests exercise lazy mounting,
Vue events/reactivity, simulated projection redraws, position changes, map changes,
closing/unmount cleanup, and SSR without Google Maps or a DOM. The simulated Maps
API does not replace the real-map visual checks above.

## Step 3: verify the shared polaroid preset

Open `http://localhost:5000/dev/polaroid-overlay`. This independent demo uses the
new `TrollPolaroidOverlay` component with local markers and the layer logo as its
sample image. The existing `TrollMap` and Magenta still use the legacy overlay at
this checkpoint; selecting a preset in `TrollMap` is the next step.

1. Hover the location marker, or use **Show location label** and **Hide location
   label**, to check labels appear on demand.
2. Hover a photo marker for the 250 ms preview delay. **Preview first photo** and
   **Mouse out first photo** provide repeatable equivalents for showing/dismissing
   the preview. Dismissed content should disappear from the DOM, including after
   the brief exit transition.
3. Pin both photos, then use **Mouse out first photo**. Both should remain open.
   Each close button should dismiss only its own preview.
4. Pan and zoom with pinned previews. They should follow their markers through
   Google's normal overlay lifecycle, without custom positioning listeners.
5. **Zoom below previews** should clear all previews, including pinned ones.
   Restoring the zoom should not bring dismissed previews back.
6. **Clear previews** removes all preview content immediately. **Unmount map**
   should also remove the label, previews, pending timers, and zoom listener.

The preset exposes the existing `showLabel`, `hideLabel`, `addPolaroid`,
`polaroidClicked`, `showPreview`, `removePreview`, and `removeAllPreviews` methods.
Its `previews` state contains active preview data rather than DOM references.
It uses one `zoom_changed` listener to enforce the minimum preview zoom (default
9), independent of geographic positioning. There are no per-marker listeners or
pre-created hidden preview elements in the preset.

Overlay CSS now lives in `app/assets/ui/scss/map-overlays.css`, imported by both
the legacy marker component and the new preset. Existing classes and CSS custom
properties are preserved. The new label uses `.marker-location-label`, avoiding
duplicate IDs across maps; application styles using `#marker-location-label` will
need the class selector when migrating to the new preset.

Run both sets of tests with:

```sh
node --test tests/map-overlay.test.mjs tests/polaroid-overlay.test.mjs
```

## Step 4: select an overlay in TrollMap

Open `http://localhost:5000/dev/map-options`. This demo uses `TrollMap` itself with
ordinary markers that have no `level` or `polaroids` fields.

1. Start with **Use no overlay**. Click and hover markers: the event status should
   change, but there should be no overlay instance or overlay DOM. The styled map,
   custom icons, explicit marker label, and zoom controls still work.
2. Choose **Use custom overlay**, then click a marker. The card uses the component
   and heading passed by the app. **Visit this place** should increment Visits;
   its click behavior belongs to the custom component.
3. While a card is open, choose **Use no overlay**. Its instance and DOM should be
   removed. Switching to another component also disposes the previous instance.
4. Choose **Use polaroid overlay**, then click a marker. The shared preset should
   show and pin its preview through the same `TrollMap` component.
5. **Show one marker** should center that marker while preserving the current
   zoom, without assuming country/state/city/polaroid data.

### Consuming app API

```vue
<script setup lang="ts">
import { TrollPolaroidOverlay } from "#components"
</script>

<template>
  <!-- No overlay is the default. -->
  <TrollMap :markers="places" />

  <!-- Explicitly select the shared preset for this map. -->
  <TrollMap
    ref="map"
    :markers="photos"
    :overlay-component="TrollPolaroidOverlay"
    :overlay-props="{ polaroidMaxZoom: 9 }"
    @markerClick="markerClick"
  />
</template>
```

`overlay-component` accepts an imported/resolved Vue component or `null` (default).
`overlay-props` passes that component's settings and event callbacks. `TrollMap`
supplies the native `map` and Maps `api` props; those two context props cannot be
overridden through `overlay-props`. A custom component can use `TrollMapOverlay`
for its pinned content and expose whatever interaction methods its app needs.

The map's exposed `overlay` ref contains the selected component's exposed API,
or `null` before it mounts, when disabled, or when no component is supplied.
An initially selected, synchronously imported component mounts before `@ready`.
For async components, watch the exposed `overlay` ref for their resolved instance.
Marker events are always forwarded; selecting an overlay does not automatically
assign hover or click rules. The obsolete `labelOverlay` class exposure is removed;
the polaroid preset's `showLabel`/`hideLabel` methods handle labels.

If the consuming app already loads Google Maps, pass its `Promise<typeof google>`
as `api-promise`. `TrollMap` forwards it to `GoogleMap`, so the app can reuse its API
instance without initializing a second loader.

Basic markers require only `id` and `position`. `title`, explicit `label`, icon and
hover icon, color, icon options, and native marker options remain optional. Legacy
markers supplying `polaroids` still receive count labels; `level="polaroid"` still
suppresses those labels. The original hierarchy helpers remain available.

The old polaroid map playground now opts into the Vue preset explicitly. Step 5
migrates Magenta's wrapper to opt in as well. The legacy overlay factory exports
remain available.

```sh
node --test tests/map-overlay.test.mjs tests/polaroid-overlay.test.mjs tests/troll-map.test.mjs
```

## Step 5: Magenta integration

Magenta's map wrapper now explicitly selects the shared preset, preserves its
existing public methods and marker handlers, uses the new label class for its
purple theme, and forwards events once. Its Google Maps plugin provides the
`api-promise` passed through the layer.

Magenta selects the local `../../troll-ui` checkout when `NUXT_ENV=dev`, and the
GitHub layer source in other environments, using a named `troll-ui` layer tuple.
Publish the shared layer changes before deploying Magenta. Its `docs/map-overlays.md` has
the launch command and a development-only `/dev/map-overlays` sample page. The
page uses the real app wrapper, sample data, and Magenta's authentication policy.
Magenta skips login with explicit `NUXT_ENV=dev` unless
`NUXT_PUBLIC_SHOW_LOGIN=true`; its `docs/development-login.md` describes the switch.

The consuming app needs TypeScript available as a development dependency for Vue
to resolve imported prop types in the layer. Magenta now pins TypeScript 5.9.3.

From the layer repository, test the real Magenta wrapper against a stubbed map
without a browser, Google key, or database:

```sh
MAGENTA_SITE=../magenta/site node --test tests/integration/magenta-map.test.mjs
```

This verifies preset selection, sharing the app's loaded API, marker icon/color
settings, the exposed controller methods, and single event forwarding. Browser
checks verified a real city editor's map, a real tracked-day map and place label,
and sample photo pin/close behavior. The sample page also verified label movement
on pan and cleanup when the map unmounts. No existing records were changed.
