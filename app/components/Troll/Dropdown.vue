<template lang="pug">
div(ref="container").custom-dropdown
	label(v-if="label !== ''" v-html="label" :id="`${id}-label`" @click="focusDropdown").default-label.dropdown-label
	div(ref="wrap" :class="clickFocused ? 'click-focused' : ''").dropdown-input-wrap
		<slot name="before"></slot>
		div.dropdown-mobile-select-container
			select(v-model="selectedValue" ref="dropdownSelect" @mousedown="mobileMousedown = true" :aria-describedby="`${id}-label`").dropdown-select-input
				option(v-for="(option, index) in dropdownOptions" :key="option.value" :value="option.value") {{option.label}}
			<Icon v-if="icon?.name" :size="icon?.size?.toString() ?? 'none'" :name="icon?.name" v-bind="icon?.attrs" class="dropdown-arrow"/>
		button(type="button" ref="dropdownTrigger" @mousedown="desktopMousedown = true" :aria-describedby="`${id}-label`" role="combobox" aria-haspopup="listbox" :aria-controls="id" :aria-activedescendant="expanded ? `${id}-${selectedValue}` : undefined" :aria-expanded="expanded ? 'true' : 'false'"
			@keydown.down.exact.prevent="goDown"
			@keydown.up.exact.prevent="goUp"
			@keydown.home.prevent="selectFirst"
			@keydown.end.prevent="selectLast"
			@keydown.alt.down.exact.prevent="!expanded ? openDropdown() : closeDropdown()"
			@keydown.alt.up.exact.prevent="!expanded ? openDropdown() : closeDropdown()"
			@keydown.space.exact.prevent="spaceHit"
			@click="!expanded ? openDropdown() : closeDropdown()"
			@keydown="keydown"
		).dropdown-trigger
			span.dropdown-trigger-label {{selectedLabel}}
			<Icon v-if="icon?.name" :name="icon?.name" :size="icon?.size?.toString() ?? 'none'" v-bind="icon?.attrs" class="dropdown-arrow"/>
		<TrollDropdownWrap ref="dropdownWrap" :expanded="expanded" :isEnd="isEnd" :isStart="isStart" @opened="focusSelectedOption">
			ul(:id="id" role="listbox" ref="dropdownList").dropdown-list
				li(v-for="(option, index) in dropdownOptions" ref="listItemOptions" class="dropdown-option" role="option" tabindex="-1" :id="`${id}-${option.value}`"
					:aria-posinset="index + 1"
					:aria-setsize="dropdownOptions.length"
					:aria-selected="option.value == selectedValue ? 'true' : 'false'"
					@keydown.space.exact.prevent="spaceHit"
					@click="selectOption(option)"
					@keydown.enter.exact.prevent="selectOption(option)"
					@keydown.escape.exact.prevent="closeDropdown"
					@keydown.alt.up.exact.prevent="closeDropdown"
					@keydown.alt.down.exact.prevent="closeDropdown"
					@keydown.tab.exact="closeDropdown(false)"
					@keydown.shift.tab.exact="closeDropdown(false)"
					@keydown.up.exact.prevent="goUp"
					@keydown.down.exact.prevent="goDown"
					@keydown.home.exact.prevent="selectFirst"
					@keydown.end.exact.prevent="selectLast"
					@keydown="keydown"
				)
					span.option-label {{option.label}}
					span(:aria-hidden="option.value == selectedValue ? 'false' : 'true'").sr-only , Selected
		</TrollDropdownWrap>
		<slot name="after"></slot>
</template>

<script setup lang="ts">
  import { onClickOutside } from "@vueuse/core"
  const isMobile = useTrollBreakpoints()?.smallerOrEqual("dropdown") ?? false

  const id = useId()
  const expanded = ref(false)
  const typedText = ref("")
  const lastTyped = ref(0)
  const isEnd = ref(false)
  const isStart = ref(true)
  const container = ref<null | HTMLDivElement>(null)
  const dropdownSelect = ref<null | HTMLSelectElement>(null)
  const dropdownTrigger = ref<null | HTMLButtonElement>(null)
  const dropdownList = ref<null | HTMLUListElement>(null)
  const listItemOptions = ref<null | HTMLLIElement[]>(null)
  const wrap = ref<null | HTMLDivElement>(null)
  const dropdownWrap = ref<null | HTMLDivElement>(null)

  onClickOutside(container, () => (expanded.value = false))
  const { height } = useElementBounding(wrap)
  const mobileHover = useElementHover(dropdownSelect)
  const desktopHover = useElementHover(dropdownTrigger)
  const desktopMousedown = ref(false)
  const mobileMousedown = ref(false)
  const { focused: desktopFocused } = useFocus(dropdownTrigger)
  const { focused: mobileFocused } = useFocus(dropdownSelect)
  const desktopClickFocused = ref(false)
  const mobileClickFocused = ref(false)

  watch(desktopFocused, isFocused => {
    if (isFocused && desktopMousedown.value) {
      desktopClickFocused.value = true
    }
    if (!isFocused && desktopClickFocused.value) {
      desktopClickFocused.value = false
    }
    desktopMousedown.value = false
  })

  watch(mobileFocused, isFocused => {
    if (isFocused && mobileMousedown.value) {
      mobileClickFocused.value = true
    }
    if (!isFocused && mobileClickFocused.value) {
      mobileClickFocused.value = false
    }
    mobileMousedown.value = false
  })

  const clickFocused = computed(() => {
    return isMobile.value ? mobileClickFocused.value : desktopClickFocused.value
  })

  const focused = computed(() => {
    return isMobile.value ? mobileFocused.value : desktopFocused.value
  })

  watch(
    () => isMobile.value,
    () => {
      if (isMobile.value) expanded.value = false
    }
  )

  useEventListener(dropdownList, "scroll", updateScrollEnd)
  useResizeObserver(dropdownList, updateScrollEnd)

  const emit = defineEmits<{
    (e: "change", value: string): void
  }>()

  interface Option {
    label: string
    value: string
  }

  const props = withDefaults(
    defineProps<{
      options: Option[]
      label?: string
      icon?: Icon
    }>(),
    {
      label: "",
      icon: {
        name: "material-symbols:keyboard-arrow-down-rounded",
        size: "1.25em",
        attrs: {},
      },
    }
  )
  const selectedValue = defineModel()

  const iconSize = computed(() => props.icon.size)

  const { options: dropdownOptions, label } = toRefs(props)
  watch(dropdownOptions, () => nextTick(updateScrollEnd), { deep: true })
  const selectedLabel = computed(() => {
    if (dropdownOptions.value === null) return ""
    return dropdownOptions.value.find(option => option.value == selectedValue.value)?.label ?? ""
  })

  function updateScrollEnd() {
    const list = dropdownList.value
    isStart.value = !list || list.scrollTop <= 1
    isEnd.value = !!list && list.scrollHeight - list.scrollTop - list.clientHeight <= 1
  }

  function focusSelectedOption(index = dropdownOptions.value.findIndex(option => option.value == selectedValue.value)) {
    if (!expanded.value) return
    const option = listItemOptions.value?.[index]
    const list = dropdownList.value
    if (!option || !list) return

    // Keep browser focus from scrolling the page or the animated wrappers.
    option.focus({ preventScroll: true })
    const listRect = list.getBoundingClientRect()
    const optionRect = option.getBoundingClientRect()
    const style = getComputedStyle(list)
    const inset = 4
    const availableInset = Math.max(0, (list.clientHeight - optionRect.height - inset * 2) / 2)
    const topFade = Math.min(parseFloat(style.scrollPaddingTop) || 0, availableInset)
    const bottomFade = Math.min(parseFloat(style.scrollPaddingBottom) || 0, availableInset)
    const visibleTop = listRect.top + topFade + inset
    const visibleBottom = listRect.bottom - bottomFade - inset
    if (optionRect.bottom > visibleBottom) {
      list.scrollTop += optionRect.bottom - visibleBottom
    } else if (optionRect.top < visibleTop) {
      list.scrollTop += optionRect.top - visibleTop
    }
    updateScrollEnd()
  }

  async function openDropdown() {
    expanded.value = true
    await nextTick()
    focusSelectedOption()
  }

  async function closeDropdown(restoreFocus = true) {
    expanded.value = false
    typedText.value = ""
    if (restoreFocus) {
      await nextTick()
      dropdownTrigger.value?.focus({ preventScroll: true })
    }
  }

  function spaceHit() {
    if (Date.now() - lastTyped.value < 1000 && typedText.value.trim() !== "") return
    if (!expanded.value) openDropdown()
    else closeDropdown()
  }

  function focusDropdown() {
    if (isMobile.value) dropdownSelect.value?.focus()
    else dropdownTrigger.value?.focus()
  }

  function selectOption({ value }: Option) {
    selectedValue.value = value
    closeDropdown()
  }

  function setSelected(index: number) {
    const option = dropdownOptions.value[index]
    if (!option) return
    selectedValue.value = option.value
    focusSelectedOption(index)
  }

  function goDown() {
    typedText.value = ""
    const index = dropdownOptions.value.findIndex(option => option.value == selectedValue.value)
    setSelected(index + 1)
  }

  function goUp() {
    typedText.value = ""
    const index = dropdownOptions.value.findIndex(option => option.value == selectedValue.value)
    setSelected(index - 1)
  }

  function selectFirst() {
    typedText.value = ""
    setSelected(0)
  }

  function selectLast() {
    typedText.value = ""
    setSelected(dropdownOptions.value.length - 1)
  }

  function keydown(event: KeyboardEvent) {
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return
    const now = Date.now()
    const continuing = now - lastTyped.value < 1000 && typedText.value !== ""
    if (event.key === " " && !continuing) return
    event.preventDefault()
    typedText.value = continuing ? typedText.value + event.key.toLowerCase() : event.key.toLowerCase()
    lastTyped.value = now

    const index = dropdownOptions.value.findIndex(option => option.value == selectedValue.value)
    const start = continuing ? Math.max(index, 0) : index + 1
    const searchable = [...dropdownOptions.value.slice(start), ...dropdownOptions.value.slice(0, start)]
    const foundItem = searchable.find(option => option.label.toLowerCase().startsWith(typedText.value))
    if (foundItem) setSelected(dropdownOptions.value.indexOf(foundItem))
  }

  const isHovered = computed(() => {
    return isMobile.value ? mobileHover.value : desktopHover.value
  })

  defineExpose({
    selectedValue,
    // props,
    isHovered,
    clickFocused,
    focused,
    expanded,
    wrap: computed(() => wrap.value),
    height: computed(() => Math.ceil(height.value + (dropdownWrap.value?.height ?? 0))),
  })
</script>

<style scoped>
  .custom-dropdown {
    --dropdown-fade-height: 2.25em;
    position: relative;
    display: inline-block;
    width: 100%;
  }
  /* Raise this dropdown only while its popup is present, including the closing transition. */
  .custom-dropdown:has(.dropdown-outer-wrap[data-present=true]) {
    z-index: var(--dropdown-wrap-z-index, 20);
  }
  .custom-dropdown :deep(.dropdown-outer-wrap) {
    box-shadow: var(--dropdown-shadow, 0 4px 12px rgb(0 0 0 / 0.18));
  }

  .custom-dropdown:has(.dropdown-trigger:hover:not(:focus)) :deep(.dropdown-outer-wrap) {
    --dropdown-border: var(--trigger-hover-border) !important;
  }

  .dropdown-trigger {
    --focus-offset: 2px;
    padding: var(--trigger-padding, 0.95em 1em 0.95em 1.5em);
    font-size: var(--trigger-font, 0.85em);
    letter-spacing: 0.075em;
    transition: color 0.2s ease-in-out, border 0.2s ease-in-out;
  }
  .dropdown-trigger:hover:not(:focus) {
    color: var(--trigger-hover-color, var(--troll-ui-dark-grey));
    border: var(--trigger-hover-border, 1px solid var(--troll-ui-grey));
  }
  .dropdown-trigger[aria-expanded=true] + .dropdown-outer-wrap {
    opacity: 1;
  }
  .dropdown-trigger[aria-expanded=true] .dropdown-arrow {
    transform: rotate(180deg);
  }
  .dropdown-trigger[aria-expanded=true] .dropdown-arrow {
    transition-delay: var(--dropdown-arrow-delay, 0.15s);
  }
  @viewport (dropdown-mobile-viewport down) {
    .custom-dropdown .dropdown-trigger {
      display: none;
    }
  }

  .dropdown-arrow {
    margin-left: var(--arrow-left, 0.5em);
    display: block;
    transition: var(--dropdown-arrow-transition, transform 0.275s ease-in-out);
  }

  .dropdown-trigger-label {
    line-height: 1.4;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dropdown-mobile-select-container {
    position: relative;
    color: var(--dropdown-color, var(--textbox-color, var(--troll-ui-dark-grey)));
    background-color: var(--dropdown-background, var(--textbox-background, transparent));
  }
  .dropdown-mobile-select-container .dropdown-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: v-bind(iconSize);
    right: var(--dropdown-container-padding-right, 1em);
  }
  @viewport (dropdown-mobile-viewport up) {
    #main .dropdown-mobile-select-container {
      display: none;
    }
  }

  .dropdown-select-input {
    --focus-offset: 2px;
    display: block;
    width: 100%;
    border: 0;
    -webkit-appearance: none;
    padding: var(--trigger-padding, 0.95em 1em 0.95em 1.5em);
    padding-right: calc(v-bind(iconSize) + var(--dropdown-container-padding-right, 1em) + 0.5em);
    font-family: var(--trigger-font, arial);
    font-size: 1em;
    letter-spacing: 0.075em;
    background-color: transparent;
    color: var(--dropdown-color, var(--textbox-color, var(--troll-ui-dark-grey)));
  }

  .dropdown-list > li[aria-selected=true] {
    background-color: var(--option-selected-background, var(--troll-ui-grey));
    --focus-color: var(--option-selected-color, white);
  }
  .dropdown-list > li:not([aria-selected=true]):hover {
    background-color: var(--option-hover-background, var(--troll-ui-dark-grey));
    color: var(--option-hover-color, white);
  }

  .dropdown-trigger,
  .dropdown-mobile-select-container {
    background-color: var(--dropdown-background, var(--textbox-background, transparent));
    border: var(--dropdown-border, var(--textbox-border, 1px solid var(--troll-ui-grey)));
    color: var(--dropdown-color, var(--textbox-color, var(--troll-ui-dark-grey)));
    text-align: left;
    position: relative;
    display: flex;
    width: 100%;
    align-items: center;
    transition: color var(--troll-ui-ani-fast);
    justify-content: space-between;
    font-family: var(--trigger-font, arial);
    font-weight: var(--trigger-font-weight, inherit);
    font-size: var(--trigger-font-size, 0.85em);
    border-radius: var(--dropdown-border-radius, var(--textbox-border-radius, 0.25rem));
  }

  .dropdown-option {
    font-size: var(--option-size, 0.9em);
    color: var(--option-color, var(--textbox-color, var(--troll-ui-dark-grey)));
  }

  .dropdown-inner-wrap > ul > li {
    color: var(--option-color, var(--textbox-color, var(--troll-ui-dark-grey)));
  }
  .dropdown-inner-wrap > ul > li:first-child {
    margin-top: 0.5rem;
  }

  .dropdown-label {
    color: var(--dropdown-label-color, var(--textbox-label-color));
  }
</style>
