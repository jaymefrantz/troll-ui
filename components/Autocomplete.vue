<template lang="pug">
div(ref="container").autocomplete-container
  label(v-if="label !== ''" v-html="label" :for="id").default-label
  div.autocomplete-input-wrap
    <Icon class="close-icon" :size="searchIcon.size.toString()" :name="searchIcon.name"/>
    input(type="text" v-model="query" :id="id"
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
      <Icon class="close-icon" :size="closeIcon.size.toString()" :name="closeIcon.name"/>
  <DropdownWrap :expanded="!hideResults && hasResults" :isEnd="isEnd">
      ul(ref="resultList").autocomplete-results-list
        li(v-for="(result, index) in results ?? []" :key="result" @click="selected(result)" ref="resultListItems" :class="{ 'selected': index === focusedIndex }")
          <component v-bind="options[result]" :is="itemComponent"/>
  </DropdownWrap>
</template>

<script setup lang="ts">
  import stringSimilarity from "string-similarity"
  const id = `autocomplete-${useId()}`
  import { onClickOutside } from "@vueuse/core"

  const defaultIcons = {
    search: {
      name: "material-symbols-light:search-rounded",	
    },
    close: {
      name: "material-symbols-light:close-rounded",	
    }
  }

  const props = withDefaults(
    defineProps<{
      placeholder?: string
      items: Array<any>
      searchedProp?: string
      label?: string
      override?: string
      searchIcon?: Icon
      closeIcon?: Icon
      itemComponent: Object
    }>(),
    {
      placeholder: "Search Google maps",
      label: "",
      override: "",
      searchedProp: "text",
    }
  )

  const closeIcon = useIconDefaults(props?.closeIcon, defaultIcons.close)
  const searchIcon = useIconDefaults(props?.searchIcon, defaultIcons.search)

  const emit = defineEmits<{
    (e: "typed", value: string): void
    (e: "selected", value: string | null): void
  }>()

  const { placeholder, items, label, override, searchedProp } = toRefs(props)
  const query = ref("")
  const typedSearch = ref("")
  const results = ref([])
  const wasReservedKey = ref(false)
  const focusedIndex = ref(-1)
  const hideResults = ref(false)
  const textInput = ref<HTMLInputElement | null>(null)
  const resultListItems = ref<HTMLElement | null>(null)
  const container = ref<HTMLDivElement | null>(null)
  const resultList = ref<HTMLElement | null>(null)
  const isEnd = ref(false)
  const { arrivedState, y } = useScroll(resultList, { 'throttle' : 200 })
	const { bottom } = toRefs(arrivedState)
  watch(y, () => {
		isEnd.value = bottom.value;
	})

  query.value = override.value ?? ""

  const options = computed(() => {
    return items.value.reduce((obj, item) => ({ ...obj, [item[searchedProp.value].toLowerCase()]: { ...item, text: item[searchedProp.value] } }), {})
  })

  const hasResults = computed(() => results.value.length > 0 && query.value !== "")
  
  onClickOutside(container, () => {
    if(!hideResults.value && hasResults.value) {
      hideResults.value = true
      focusedIndex.value = -1
    }
  })

  watch(typedSearch, useDebounceFn(setResults, 200))

  function setResults() {
    if (typedSearch.value.split("").length > 3 && Object.keys(options.value).length > 0) {
        results.value = stringSimilarity
          .findBestMatch(
            typedSearch.value.toLowerCase(),
            Object.keys(options.value)
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
  }

  watch(() => items.value, async() => {
    await wait(10)
    setResults()
  })

  async function keydown({ target }: Event) {
    await wait(1)

    if (!wasReservedKey.value) {
      typedSearch.value = query.value
      hideResults.value = query.value === ""
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
    if(results.value.length === 0) return
    wasReservedKey.value = true
    focusedIndex.value = focusedIndex.value < results.value.length - 1 ? focusedIndex.value + 1 : 1
  }

  function goUp() {
    if(results.value.length === 0) return
    wasReservedKey.value = true
    focusedIndex.value = focusedIndex.value > 0 ? focusedIndex.value - 1 : results.value.length - 1
  }

  function selected(name: string) {
    wasReservedKey.value = true
    const item = options.value[name]
    query.value = item[searchedProp.value]
    hideResults.value = true
    focusedIndex.value = -1
    emit("selected", item)
  }

  function enterPressed() {
    wasReservedKey.value = true
    
    if (focusedIndex.value !== -1) {
      selected(focusedOption.value)
    }
  }

  const focusedOption = computed(() => {
    return results.value[focusedIndex.value]
  })

  watch(focusedIndex, index => {
    if(index === -1) return
    const item = options.value[focusedOption.value]
    const element = resultListItems.value[index]
    query.value = item[searchedProp.value]
    if(!isLiVisible(element)) {
      resultListItems.value[index - 1].scrollIntoView()
    }
  })

  function isLiVisible(liElement) {
    const liRect = liElement.getBoundingClientRect()
    const ulRect = resultList.value.getBoundingClientRect()

    return (
        liRect.top >= ulRect.top &&
        liRect.bottom <= ulRect.bottom
    )
}

  function focused() {
    if(hasResults.value) {
      hideResults.value = false
      focusedIndex.value = results.value.findIndex(name => name === query.value.toLowerCase())
    }
  }

  function close() {
    query.value = ""
    typedSearch.value = ""
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
    setResults,
    query,
  })
</script>

<style lang="scss" scoped>
  .autocomplete-container {
    position: relative;
  }
  
  .autocomplete-input-wrap {
    background-color: var(--autocomplete-background, white);
		border: var(--autocomplete-border, 1px solid $grey);
    color: var(--autocomplete-color, $grey);
		border-radius: var(--autocomplete-border-radius, 1.75rem);
    padding: var(--autocomplete-wrap-padding, 0 0.5em);
    display: flex;
    align-items: center;
    justify-content: space-between;


    &:focus-within {
      outline: 2px solid var(--focus-color);
      outline-offset: 3px;

      color: var(--focus-color);
    }
  }

  .autocomplete-input {
    color: currentColor;
    font-family: var(--autocomplete-font, arial);
    font-size: var(--autocomplete-font-size, 0.85em);
    font-weight: var(--autocomplete-font-weight, inherit);
    padding: var(--autocomplete-padding, 0.95em 1em 0.95em 0.5em);
    background: transparent;
    display: block;
    width: 100%;
    border: 0;
    outline: 0;

    &::placeholder {
      color: currentColor;
    }
  }

  .autocomplete-close-button {
    background: var(--close-button-background, transparent);
    border: 0;
    padding: 0;
    color: currentColor;
  }

  .autocomplete-results-list {
    & > li {
      &.selected {
        background-color: var(--option-selected-background, $grey);
        color: var(--option-selected-color, white);
      }

      &:not(.selected):hover {
        background-color: var(--option-hover-background, $dark-grey);
        color: var(--option-hover-color, white);
      }
    }
  }

</style>