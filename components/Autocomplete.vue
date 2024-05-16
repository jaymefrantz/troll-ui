<template lang="pug">
p query: {{ query }}
p typedSearch: {{ typedSearch }}
div(ref="container").autocomplete-container
  label(v-if="label !== ''" v-html="label" for="autocomplete").default-label
  div.autocomplete-input-wrap
    input(type="text" v-model="query" id="autocomplete"
      ref="textInput"
      @blur="blured"
      @focus="focused"
      @keydown.up.exact.prevent="goUp"
      @keydown.down.exact.prevent="goDown"
      @keydown.escape.exact.prevent="escaped"
      @keydown.enter.exact.prevent="enterPressed"
      @keydown="keydown"
      autocomplete="off"
      :placeholder="placeholder"
    ).autocomplete-input
    button(type="button" @click="close" v-show="query?.split('').length > 0").autocomplete-close-button
  transition(name="autocomplete-outer-wrap")
    div(v-show="!hideResults && hasResults").autocomplete-outer-wrap
      div.autocomplete-inner-wrap
        ul.autocomplete-results-list
          li(v-for="(result, index) in results ?? []" :key="result" @click="selected(index)" ref="resultListItems" :class="{ 'focused': index === focusedIndex }")
            <component v-bind="items[index]" :is="itemComponent"/>
</template>

<script setup lang="ts">
  import stringSimilarity from "string-similarity"
  import { onClickOutside } from "@vueuse/core"

  const props = withDefaults(
    defineProps<{
      placeholder?: string
      options?: []
      label?: string
      override?: string
      icon?: string
      closeIcon?: string
      itemComponent: Object
      items: []
    }>(),
    {
      placeholder: "Search Google maps",
      closeIcon: "material-symbols-light:close-rounded",
      label: "",
      override: "",
      options: [],
      items: [],
    }
  )

  const emit = defineEmits<{
    (e: "typed", value: string): void
    (e: "selected", value: string | null): void
  }>()

  const { placeholder, options, label, override, items } = toRefs(props)
  const query = ref("")
  const typedSearch = ref("")
  const results = ref([])
  const wasReservedKey = ref(false)
  const focusedIndex = ref(-1)
  const hideResults = ref(false)
  const textInput = ref<HTMLInputElement | null>(null)
  const resultListItems = ref<HTMLElement | null>(null)
  const container = ref<HTMLDivElement | null>(null)
  //will need to make sure this is needed
  //selectedValue.value = props?.override ?? dropdownOptions.value[0].value	

  const hasResults = computed(() => results.value.length > 0 && query.value !== "")
  /*
    todo:
    - when focused it needs to open if there's results
    - end on scroll
    - make sure the selected item is in view
    - close button
    - search icon
  */
  onClickOutside(container, () => {
    if(!hideResults.value && hasResults.value) {
      hideResults.value = true
      focusedIndex.value = -1
    }
  })

  watch(
    typedSearch,
    useDebounceFn(() => {
      if (typedSearch.value.split("").length > 3 && options.value.length > 0) {
        results.value = stringSimilarity
          .findBestMatch(
            typedSearch.value.toLowerCase(),
            options.value.map(name  => name.toLowerCase())
          )
          .ratings.filter(({ rating }) => rating !== 0)
          .sort((a, b) => {
            if (a.rating < b.rating) {
              return -1
            }
            if (a.rating > b.rating) {
              return 1
            }
          })
          .reverse()
          .reduce((unique, item) => {
            //needs this reduce cause string similarity is doing some weird stuff and adding duplicates even though autocompleteItems are unique and clean
            return !unique.map(({ target }) => target).includes(item.target) ? [...unique, item] : unique
          }, [])
          .splice(0, 12).map(({ target }) => target)
      } else {
        results.value = []
      }
    }, 200)
  )

  async function keydown({ target }: Event) {
    await wait(1)

    if (!wasReservedKey.value) {
      if (query.value !== "") {
        //emit("typed", query.value)
        typedSearch.value = query.value
        hideResults.value = false
      } else {
        hideResults.value = true
      }
    }

    await wait(10)
    wasReservedKey.value = false
  }

  function escaped() {
    wasReservedKey.value = true
    hideResults.value = true
    focusedIndex.value = -1
    emit("selected", null)
  }

  async function goDown() {
    wasReservedKey.value = true
    focusedIndex.value = focusedIndex.value < results.value.length - 1 ? focusedIndex.value + 1 : 1
  }

  function goUp() {
    wasReservedKey.value = true
    focusedIndex.value = focusedIndex.value > 0 ? focusedIndex.value - 1 : results.value.length - 1
  }

  function selected(index: number) {
    wasReservedKey.value = true
    query.value = items.value[index].text
    hideResults.value = true
    focusedIndex.value = -1
    emit("selected", results.value[index])
  }

  function enterPressed() {
    wasReservedKey.value = true
    
    if (focusedIndex.value !== -1) {
      selected(focusedIndex.value)
    }
  }

  watch(focusedIndex, index => {
    if(index === -1) return
    query.value = items.value[index].text
  })

  function focused() {
    if(hasResults.value) {
      hideResults.value = false
      focusedIndex.value = items.value.findIndex(({ text }) => text === query.value)
    }
  }

  function close() {
    query.value = ""
    hideResults.value = true
    emit("selected", null)
  }

  async function blured() {
    await wait(100)
    wasReservedKey.value = true
    hideResults.value = true
  }

  defineExpose({
    results,
    props,
  })
</script>

<style lang="scss" scoped>
  .focused {
    background: red;
  }

</style>