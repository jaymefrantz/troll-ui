<template lang="pug">
div(ref="container").autocomplete-container
  label(v-if="label !== ''" v-html="label" :for="id").default-label
  div(ref="wrap" :class="clickFocused ? 'click-focused' : ''").autocomplete-wrap
    <slot name="before"></slot>
    div.autocomplete-input-wrap
      <Icon class="search-icon" :size="searchIcon?.size?.toString()" :name="searchIcon.name"/>
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
        @click="clickFocused = true" 
        @mousedown="mouseDown = true"
      ).autocomplete-input
      button(type="button" @click="close" v-show="query?.split('').length > 0").autocomplete-close-button
        <Icon class="close-icon" :size="closeIcon?.size?.toString()" :name="closeIcon.name"/>
    <TrollDropdownWrap :expanded="!hideResults && hasResults" :isEnd="isEnd" ref="dropdownWrap">
        ul(ref="resultList").autocomplete-results-list
          li(v-for="(result, index) in results ?? []" :key="result.id" @click="selected(result)" ref="resultListItems" :class="{ 'selected': index === focusedIndex }")
            <component v-bind="result" :is="itemComponent" :selected="query === result.name"/>
    </TrollDropdownWrap>
    <slot name="after"></slot>
</template>

<script setup lang="ts">
  const id = `autocomplete-${useId()}`
  import { onClickOutside } from "@vueuse/core"

  const props = withDefaults(
    defineProps<{
      placeholder?: string
      results: Array<any>
      searchedProp?: string
      label?: string
      override?: string
      searchIcon?: Icon
      closeIcon?: Icon
      itemComponent?: Object
    }>(),
    {
      placeholder: "Search Google maps",
      label: "",
      override: "",
      searchedProp: "text",
      searchIcon: {
        name: "material-symbols-light:search-rounded",
        size: "1.5em",
      },
      closeIcon: {
        name: "material-symbols-light:close-rounded",
        size: "1.5em",
      },
    }
  )

  const emit = defineEmits<{
    (e: "typed", value: string): void
    (e: "selected", value: string | null): void
  }>()

  const { placeholder, results, label, override, searchedProp } = toRefs(props)
  const query = ref("")
  const typedSearch = ref("")
  const wasReservedKey = ref(false)
  const focusedIndex = ref(-1)
  const hideResults = ref(false)
  const textInput = ref<HTMLInputElement | null>(null)
  const resultListItems = ref<HTMLElement | null>(null)
  const container = ref<HTMLDivElement | null>(null)
  const resultList = ref<HTMLElement | null>(null)
  const wrap = ref<HTMLElement | null>(null)
  const dropdownWrap = ref<null | HTMLDivElement>(null)
  const isEnd = ref(false)
  const { arrivedState, y } = useScroll(resultList, { throttle: 200 })
  const { bottom } = toRefs(arrivedState)
  const isHovered = useElementHover(textInput)
  const { focused: inputFocused } = useFocus(textInput)
  const mouseDown = ref(false)
  const clickFocused = ref(false)
  const { height } = useElementBounding(wrap)

  watch(y, () => {
    isEnd.value = bottom.value
  })

  query.value = override.value ?? ""

  const hasResults = computed(() => results.value.length > 0 && query.value !== "")

  onClickOutside(container, () => {
    if (!hideResults.value && hasResults.value) {
      hideResults.value = true
      focusedIndex.value = -1
    }
  })

  watch(typedSearch, (newValue, oldValue) => {
    emit("typed", newValue)
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
    if (results.value.length === 0) return
    wasReservedKey.value = true
    focusedIndex.value = focusedIndex.value < results.value.length - 1 ? focusedIndex.value + 1 : 0
  }

  function goUp() {
    if (results.value.length === 0) return
    wasReservedKey.value = true
    focusedIndex.value = focusedIndex.value > 0 ? focusedIndex.value - 1 : results.value.length - 1
  }

  function selected(item: any) {
    wasReservedKey.value = true
    // const item = options.value[name]
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
    if (index === -1) return
    const item = results.value[focusedIndex.value]
    const element = resultList.value?.querySelector(`li:nth-child(${index + 1})`)
    query.value = item[searchedProp.value]

    if (!isLiVisible(element) && index > 0) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    } else if (index === 0) {
      console.log(resultListItems.value[0])

      resultListItems.value[0].scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  })

  function isLiVisible(liElement) {
    const liRect = liElement.getBoundingClientRect()
    const ulRect = resultList.value.getBoundingClientRect()

    return liRect.top >= ulRect.top && liRect.bottom <= ulRect.bottom
  }

  function focused() {
    if (hasResults.value) {
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
    // hideResults.value = true
  }

  watch(inputFocused, isFocused => {
    if (isFocused && mouseDown.value) {
      clickFocused.value = true
    }
    if (!isFocused && clickFocused.value) {
      clickFocused.value = false
    }
    mouseDown.value = false
  })

  defineExpose({
    props,
    wrap,
    query: typedSearch,
    isHovered,
    clickFocused,
    focused: inputFocused,
    expanded: computed(() => !hideResults.value && hasResults.value),
    height: computed(() => Math.ceil(height.value + (dropdownWrap.value?.height ?? 0))),
    textInput: textInput,
  })
</script>

<style scoped>
  .autocomplete-container {
    position: relative;
  }

  .autocomplete-input-wrap {
    background-color: var(--autocomplete-background, var(--textbox-background, transparent));
    border: var(--autocomplete-border, var(--textbox-border, 1px solid var(--troll-ui-grey)));
    color: var(--autocomplete-color, var(--textbox-color, var(--troll-ui-dark-grey)));
    border-radius: var(--autocomplete-border-radius, var(--textbox-border-radius, 0.25rem));
    padding: var(--autocomplete-wrap-padding, 0 0.5em);
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:focus-within {
      color: var(--focus-color);
    }

    & > *:not(input.autocomplete-input) {
      flex: 0 0 auto;
    }
  }

  .autocomplete-wrap {
    position: relative;
  }

  .autocomplete-input {
    color: currentColor;
    font-family: var(--autocomplete-font, arial);
    font-size: var(--autocomplete-font-size, 0.85em);
    font-weight: var(--autocomplete-font-weight, inherit);
    padding: var(--autocomplete-padding, var(--textbox-padding-y, 0.5rem) 0.5em var(--textbox-padding-y, 0.5rem) 0.5em);
    background: transparent;
    display: block;
    width: 100%;
    border: 0;
    outline: 0;
    flex: 1 1 auto;

    &::placeholder {
      color: currentColor;
    }
  }

  .autocomplete-close-button {
    background: var(--close-button-background, transparent);
    border: 0;
    padding: 0;
    color: currentColor;
    font-size: 1em;

    svg {
      display: inline-block;
      vertical-align: middle;
    }
  }

  .autocomplete-results-list {
    & > li {
      &.selected {
        background-color: var(--option-selected-background, var(--troll-ui-grey));
        color: var(--option-selected-color, white);
      }

      &:not(.selected) > *:hover {
        background-color: var(--option-hover-background, var(--troll-ui-dark-grey));
        color: var(--option-hover-color, white);
      }

      & + li {
        margin-top: var(--option-gap, 0.5em);
      }
    }
  }
</style>
