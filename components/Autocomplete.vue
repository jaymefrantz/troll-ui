<template lang="pug">
p query: {{ query }}
p typedSearch: {{ typedSearch }}
div(ref="container").autocomplete-container
  label(v-if="label !== ''" v-html="label" for="autocomplete").default-label
  div.autocomplete-input-wrap
    <Icon class="close-icon" :size="searchIcon.size.toString()" :name="searchIcon.name"/>
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
      <Icon class="close-icon" :size="closeIcon.size.toString()" :name="closeIcon.name"/>
  transition(name="autocomplete-outer-wrap")
    div(v-show="!hideResults && hasResults").autocomplete-outer-wrap
      div.autocomplete-inner-wrap
        ul.autocomplete-results-list
          li(v-for="(result, index) in results ?? []" :key="result" @click="selected(result)" ref="resultListItems" :class="{ 'focused': index === focusedIndex }")
            //pre {{ JSON.stringify(options[result], null, "  ") }}
            <component v-bind="options[result]" :is="itemComponent"/>
</template>

<script setup lang="ts">
  import stringSimilarity from "string-similarity"
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
  //will need to make sure this is needed
  //selectedValue.value = props?.override ?? autocompleteOptions.value[0].value	
  const options = computed(() => {
    return items.value.reduce((obj, item) => ({ ...obj, [item[searchedProp.value].toLowerCase()]: { ...item, text: item[searchedProp.value] } }), {})
  })

  const hasResults = computed(() => results.value.length > 0 && query.value !== "")
  /*
    todo:
    - end on scroll
    - make sure the selected item is in view
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
    query.value = item[searchedProp.value]
  })

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
  })
</script>

<style lang="scss" scoped>
  .autocomplete-input-wrap {
    background-color: var(--autocomplete-background, white);
		border: var(--autocomplete-border, 1px solid $grey);
    color: var(--autocomplete-color, $grey);
		border-radius: var(--autocomplete-border-radius, 1.75rem);
    padding: var(--autocomplete-padding, 0.95em 1em 0.95em 1.5em);
    display: flex;
    align-items: center;
    justify-content: space-between;


    &:focus-within {
      outline: 2px dotted var(--focus-color);
      outline-offset: 3px;

      color: var(--focus-color);
    }
  }

  .autocomplete-input {
    color: currentColor;
    font-family: var(--autocomplete-font, arial);
    font-size: var(--autocomplete-font-size, 0.85em);
    font-weight: var(--autocomplete-font-weight, inherit);
    display: block;
    width: 100%;
    border: 0;
    outline: 0;

    &::placeholder {
      color: currentColor;
    }
  }

  .autocomplete-outer-wrap {
    background-color: var(--autocomplete-background, white);
    padding: var(--autocomplete-outer-padding, 0.5em 0.35em);
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    z-index: 20;
    transition: all $fast ease-in-out;
    margin-top: 0.5em;

    &:after {
      content: "";
      position: absolute;
      bottom: 0.25em;
      left: 0.5em;
      width: calc(100% - 1.5em);
      height: 2.5em;
      background: linear-gradient(-180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%);
      transition: opacity 0.15s;
      opacity: 1;
      pointer-events: none;
    }

    &.end:after {
      opacity: 0;
    }
  }

</style>