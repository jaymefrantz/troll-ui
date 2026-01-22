<template lang="pug">
TrollAutocomplete(
  ref="autocomplete"
  :results="results"
  v-bind="autocompleteProps"
  @typed="typed"
  @selected="selected"
)
  template(#before)
    <slot name="before"></slot>
  template(#after)
    <slot name="after"></slot>
</template>

<script setup lang="ts">
  const autocomplete = ref<InstanceType<typeof TrollAutocomplete> | null>(null)
  const results = ref<Array<{ name: string; id: string }>>([])
  const google = ref<any>(null)
  const isLoading = ref(false)

  interface PlaceDetails {
    placeId: string
    addressComponents: any[]
    lat: number
    lng: number
    displayName: string
    formattedAddress?: string
    parsedAddressComponents?: Record<string, string>
  }

  interface GoogleOptions {
    includedPrimaryTypes?: string[]
    excludedPrimaryTypes?: string[]
  }

  const emit = defineEmits<{
    (e: "selected", place: PlaceDetails | null): void
    (e: "error", error: { code: string; message: string; details?: any }): void
    (e: "loading", loading: boolean): void
  }>()

  const props = withDefaults(
    defineProps<{
      itemComponent: Object
      googleOptions?: GoogleOptions
      label?: string
      placeholder?: string
      searchedProp?: string
      searchIcon?: { name: string; size: string }
      closeIcon?: { name: string; size: string }
    }>(),
    {
      placeholder: "Search Google maps",
      searchedProp: "name",
      searchIcon: () => ({ name: "system-uicons:search", size: "1.25em" }),
      closeIcon: () => ({ name: "system-uicons:close", size: "1.25em" }),
    }
  )

  const autocompleteProps = computed(() => ({
    itemComponent: props.itemComponent,
    label: props.label,
    placeholder: props.placeholder,
    searchedProp: props.searchedProp,
    searchIcon: props.searchIcon,
    closeIcon: props.closeIcon,
  }))

  onMounted(async () => {
    try {
      google.value = await useNuxtApp().$google
    } catch (error: any) {
      emit("error", {
        code: "GOOGLE_INIT_FAILED",
        message: "Failed to initialize Google Maps",
        details: error,
      })
    }
  })

  async function selected(value: any) {
    if (value === null) {
      emit("selected", null)
      return
    }

    const { id, name } = value

    isLoading.value = true
    emit("loading", true)

    let placeDetails: PlaceDetails | null = null

    try {
      if (!google.value?.maps?.places?.Place) {
        throw new Error("Google Maps Places API not initialized")
      }

      const place = new google.value.maps.places.Place({
        id: id,
      })

      await place.fetchFields({
        fields: ["displayName", "addressComponents", "location", "formattedAddress"],
      })

      placeDetails = {
        placeId: id,
        addressComponents: place.addressComponents || [],
        parsedAddressComponents: parseGmapAddressComponents(place.addressComponents || []),
        lat: place.location?.lat() ?? 0,
        lng: place.location?.lng() ?? 0,
        displayName: place.displayName || name,
        formattedAddress: place.formattedAddress,
      }
    } catch (error: any) {
      emit("error", {
        code: "PLACE_FETCH_FAILED",
        message: "Failed to fetch place details",
        details: { placeId: id, error: error?.message || error },
      })
    } finally {
      isLoading.value = false
      emit("loading", false)
      emit("selected", placeDetails)
    }
  }

  async function typed(query: string) {
    if (!query) {
      results.value = []
      return
    }

    if (!google.value?.maps?.places?.AutocompleteSuggestion) {
      emit("error", {
        code: "AUTOCOMPLETE_NOT_READY",
        message: "Google Maps Autocomplete not ready",
      })
      return
    }

    try {
      const request: any = {
        input: query,
        language: "en",
      }

      if (props.googleOptions?.includedPrimaryTypes) {
        request.includedPrimaryTypes = props.googleOptions.includedPrimaryTypes
      }

      if (props.googleOptions?.excludedPrimaryTypes) {
        request.excludedPrimaryTypes = props.googleOptions.excludedPrimaryTypes
      }

      const { suggestions } = await google.value.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
        request
      )

      results.value = suggestions.map((suggestion: any) => ({
        name: suggestion.placePrediction.text.toString(),
        id: suggestion.placePrediction.placeId,
      }))
    } catch (error: any) {
      emit("error", {
        code: "AUTOCOMPLETE_FETCH_FAILED",
        message: "Failed to fetch autocomplete suggestions",
        details: { query, error },
      })
      results.value = []
    }
  }

  defineExpose({
    textInput: computed(() => autocomplete.value?.textInput ?? null),
    query: computed(() => autocomplete.value?.query ?? ""),
    isLoading: computed(() => isLoading.value),
    google: computed(() => google.value),
    expanded: computed(() => autocomplete.value?.expanded ?? false),
    height: computed(() => autocomplete.value?.height ?? 0),
    clear: () => {
      if (autocomplete.value) {
        autocomplete.value.query = ""
      }
    },
  })
</script>

<style lang="scss" scoped></style>
