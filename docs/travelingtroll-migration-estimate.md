# TravelingTroll → Troll UI migration assessment

Reviewed October 25, 2026.

Source: `/Users/jaymefrantz/Documents/travelingtroll/site`.
Target library: `/Users/jaymefrantz/Documents/troll-ui`.

## Scope: keep the layer light

Reuse existing exported Troll UI components where they fit. Keep site-specific adapters, styling, routing, data, persistence, and interaction choreography in TravelingTroll. Do not add shared buttons, ranges, help popovers, or color-picker features for this site. Generic correctness fixes to existing primitives can be considered separately; they are not permission to expand their APIs or dependencies for TravelingTroll.

The custom color-picker modal is deferred because adopting it may require presentation changes or shared extensions. Leave it local unless a later integration check demonstrates that the existing shell fits through composition alone.

## Estimate

**Existing-component migration, excluding the color-picker modal: 37–66 engineering hours. Recommended budget with 20% contingency, rounded up: 45–80 hours, approximately 5.6–10 eight-hour developer days.**

These are source-based planning estimates for one developer familiar with Vue/Nuxt. They include implementation, local verification per piece, and a separate integrated regression pass. They assume preserving the current appearance, routes, data sources, and interaction behavior. No application changes, dependency installation, runtime checks, or builds were performed during this review. This is not a fixed bid or measured execution time. Calendar time depends on developer availability.

| Piece | Existing site code | Troll UI destination / work | Hours |
| --- | --- | --- | ---: |
| Layer integration and compatibility | `nuxt.config.ts`, `package.json`, auto-imports | Add/pin the Nuxt layer; verify registration from its `app/` layout, module/dependency compatibility, Pug support, and app/layout precedence. Resolve overlapping utility/type names. Includes required compatibility work for this integration, not a general framework modernization. | 6–10 |
| Site styles and breakpoint bridge | `assets/scss`, `store/page.ts`, `store/map.ts` | Supply CSS variables in TravelingTroll for site colors, fonts, focus, and animations; reconcile global resets and wrapper styles; retain existing SCSS where needed. Configure the map breakpoint to match the site's 821px behavior and verify the layer's custom-breakpoint discovery with the site's root-directory layout. | 4–8 |
| Year dropdown | `components/Dropdown.vue`, `components/MapActions.vue` | Replace with `TrollDropdown`; use a writable model or explicit `update:modelValue` bridge to preserve year-filter clearing and updates. Preserve native mobile select and desktop keyboard behavior; style via component variables. | 2–4 |
| Location search | `components/AutoComplete.vue`, `components/MapActions.vue` | Use `TrollAutocomplete` with a small site-specific result component for marker/count/name. Adapt props/events, selected text, external clears, and keyboard handling while retaining the existing local search dataset and ranking. | 4–7 |
| Animation preference toggle | `components/MotionToggle.vue`, `components/SiteHeader.vue` | Keep the `MotionToggle` wrapper for localStorage, reduced-motion defaults, page state, and sticky/smaller behavior; replace its control with `TrollToggle`, `v-model`, and On/Off labels. | 1–2 |
| Main map rendering and zoom controls | **`layouts/map.vue`**, plus legacy `components/Map.vue` | Replace the layout's direct `GoogleMap` rendering with `TrollMap`. Bridge readiness, map instance, zoom level, route/filter changes, refitting, placeholder loading, mobile zoom limits, and resize behavior. Keep site orchestration in the layout/composable. Check and remove the redundant map component if unused. | 8–14 |
| Markers, labels, previews, and card actions | `components/Marker.vue`, `utils/gmap.ts`, `components/Card.vue`, `store/map.ts` | Use the `TrollMarker` instances rendered by `TrollMap`. Pass site icons, hover icons, and filtered counts; implement emitted marker event handlers for navigation, z-index, delayed previews, and pinned previews. Connect the shared overlay to the store and preserve card “find me” and both image providers. | 5–9 |
| Standard UI icons | Repeated search/close/chevron/filter/location/clock icons across shared controls and site components | Use the available `Icon` / `TrollIcon` path where it preserves appearance and semantics. Keep branded artwork, animated menu/weather graphics, and map SVG assets that require URLs. Include accessible labels and icon sizing. | 2–4 |
| Integrated regression and cleanup | Home, location routes, why page, Build-a-Troll, production build/prerender | Verify desktop/mobile layout, keyboard interaction, reduced motion and persistence, search/year combinations and clear actions, back/forward routing, map previews/card interactions, and both image-source modes. Smoke-check Build-a-Troll against global style changes. Run the production build/prerender with working project services/configuration. Remove replaced duplication after verification. | 5–8 |
| **Core total** | | | **37–66** |
| **Contingency allowance** | 20%, with final budgets rounded up to whole hours | | **8–14** |
| **Recommended core budget** | | | **45–80** |

The map row owns rendering/lifecycle/zoom/refit behavior; the marker row owns event handling, overlay behavior, and card integration. These are separate parts of one map migration, not two estimates for the same replacement. Shared styling is counted in the style row; component rows include only their specific styling adjustments.

## Confirmed API differences and integration risks

1. **The production map lives in the layout.** `site/layouts/map.vue:14` renders `GoogleMap` directly and owns route/filter/refit logic. `site/components/Map.vue` is a second implementation; the only `<Map>` reference found in the site's Vue files is commented out in `pages/dev/test.vue`. Replacing that component alone would not migrate the main map.

2. **Dropdown state changes need a different contract.** The site uses `:override` and `@change` (`site/components/MapActions.vue:23`). Troll UI uses `defineModel()` (`app/components/Troll/Dropdown.vue:147`). Although the library declares a `change` event, its current implementation does not emit it. Connect `v-model`/`update:modelValue` rather than carrying over the current listener.

3. **Autocomplete needs a site adapter.** The site accepts `searchResults` and emits `itemSelected`; Troll UI accepts `results` and emits `selected`. Set `searchedProp="name"` and supply a result component from TravelingTroll to retain the custom count display. The library initializes its query from `override` but does not watch subsequent changes. A site wrapper can remount the control when an external reset changes its initial text; verify focus behavior before choosing this approach. It emits `null` on clear/Escape; the site's `updateLocationFilter` currently destructures an object, so make that handler null-safe. The library's selected-event type also says string/null while the implementation emits a result object; this is a generic correctness issue, not a reason to add site-specific features.

4. **Use local search, not Google Places.** `TrollGmapAutoComplete` fetches Google place predictions/details and expects a `$google` integration. The site's search ranks its own visited locations/polaroids with `string-similarity`. `TrollAutocomplete` is the matching component; introducing Places would change the product behavior.

5. **Marker counts are named differently.** The site passes `count` based on active polaroid IDs. `TrollMarker` uses `label` or the full `polaroids.length`. Explicitly map the filtered count to `label`; otherwise markers can display incorrect counts after filtering. Site navigation, hover timing, and preview pinning belong in handlers for `TrollMap`'s marker events.

6. **Map helpers and state need deliberate ownership.** Both repos define `gmap`, `wait`, and `useObjectSort` helpers and related marker/polaroid types. The library map calls helpers through auto-imports; avoid accidentally resolving the site's overlapping exports. The site stores map/overlay instances in Pinia, while Troll UI exposes them through the map ref. The layer's overlay uses the supplied image URL directly; the site helper additionally builds a Cloudinary transformation URL and supports its content-host fallback. Preserve the intended image URL upstream. The library's custom zoom slot is currently spelled `zoomContol`; use the shipped contract or fix it and its consumers together.

7. **Breakpoints and global styles are observable behavior.** Troll UI's default map breakpoint is `20rem`; the site uses `821px`. The layer loads global reset/common/root CSS and generates wrapper/breakpoint styles, so adding `extends` affects more than newly replaced controls. Keep existing site layout, typography, motion preference, and focus styles stable through an explicit bridge. Supply site map configuration through app config as needed.

8. **Keep the color-picker modal local for now.** `TrollModal` supplies a native dialog shell, not the color-picker content or mobile choreography. Its exposed `close()` currently clears internal state/emits but does not call the native dialog's `close()` (`app/components/Troll/Modal.vue:58`). Its close button calls the native method separately. That is a generic primitive bug to assess separately. Do not add color-picker positioning, Swiper behavior, or site-specific mobile features to the layer to enable this migration.

9. **Framework compatibility is a prerequisite, not a proven blocker.** The site declares Nuxt `^3.12.3` and VueUse `10.0.2`; Troll UI declares Nuxt `^4.2.1` and VueUse `^14.0.0`, uses `app/` component placement, `useId()`, and `defineModel()`. Validate the resolved dependency versions and layer registration first. Do not assume a full Nuxt 4 application migration is mandatory. A broader framework/module upgrade uncovered by this spike should be re-estimated separately.

## Excluded work

- Keep `DefaultButton` and `FlatButton` in TravelingTroll. No exported Troll UI button exists, and site-specific animation is not justification for adding one.
- Keep the randomizer range local. The layer's playground `Range.vue` is not an exported component; do not promote it for this migration.
- Keep contextual help local. Several positioned hints can be active together; forcing these into `TrollModal` or adding a popover primitive would expand scope.
- Keep the color-picker modal local as described above. Its previous 6–10 hour migration allowance is removed from the total.
- Skip the demo-only inputs in `VirtualList.vue`; no consumer was found in the site's Vue files.
- Do not add dependencies or shared component options to reproduce site-specific behavior. If an existing primitive cannot accommodate a requirement through its public API and local composition, retain the local implementation and revise that item's scope.

## Components to retain

- `Card`, `Date`, and `List`: site-specific polaroid presentation, loading, and navigation. Compose shared controls inside them; there is no equivalent Troll UI card/list/date component.
- `CurrentLocation`: keep its EventSource connection, timezone clock, temperature, and weather state. Standard location/clock icons are covered by the icon row.
- `WeatherIcons`: retain the custom animated artwork and reduced-motion behavior.
- `SiteHeader` and `SiteFooter`: retain navigation, branding, and layout. Migrate nested controls selectively.
- Build-a-Troll components: keep domain logic, artwork, Swiper interactions, randomization, the color-picker modal, buttons, range, and help local.
- No production checkbox replacement was identified; `TrollCheckbox` does not create migration work by itself. `TrollDropdownWrap` is reused internally by the dropdown/autocomplete and needs no separate migration estimate.

## Suggested order and acceptance

1. Complete the layer/dependency/style/breakpoint integration spike and verify a representative control in a production build.
2. Migrate dropdown, autocomplete, and motion toggle. Verify combined filters, external clearing, native mobile select, keyboard selection, and persisted/reduced-motion defaults.
3. Migrate the main map and marker handlers together. Check home/location routes, browser navigation, filtered counts, one/many/zero markers, mobile zoom limits, resizing, delayed/pinned previews, card “find me,” and both image providers.
4. Finish standard icons, remove dead duplication, and complete integrated build/prerender and responsive regression checks. Smoke-check the unchanged color-picker flow for global style regressions.

Revisit the estimate after the initial integration spike, when framework compatibility and CSS impact can be measured. The expected payoff is removing duplicated primitives while keeping TravelingTroll's domain behavior in its own repo.
