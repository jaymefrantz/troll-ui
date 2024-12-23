<template lang="pug">
div(ref="container").custom-dropdown
	label(v-if="label !== ''" v-html="label" :id="`${id}-label`" @click="focusDropdown").default-label
	div.dropdown-mobile-select-container
		select(v-model="selectedValue" ref="dropdownSelect" :aria-describedby="`${id}-label`").dropdown-select-input
			option(v-for="(option, index) in dropdownOptions" :key="option.value" :value="option.value") {{option.label}}
		<Icon :size="icon.size.toString()" :name="icon.name" class="dropdown-arrow"/>
	button(type="button" ref="dropdownTrigger" :aria-describedby="`${id}-label`" role="combobox" aria-haspopup="listbox" :aria-controls="id" :aria-activedescendant="selectedValue" :aria-expanded="expanded ? 'true' : 'false'"
		@keydown.down.exact.prevent="goDown" 
		@keydown.up.exact.prevent="goUp" 
		@keydown.home.prevent="selectFirst" 
		@keydown.end.prevent="selectLast" 
		@keydown.alt.down.exact.prevent="!expanded ? openDropdown($event) : closeDropdown($event)" 
		@keydown.alt.up.exact.prevent="!expanded ? openDropdown($event) : closeDropdown($event)"
		@keydown.space.exact="() => { wasSpace = true }"
		@click="!expanded ? openDropdown($event) : closeDropdown($event)"
		@keydown.tab="() => { wasReservedKey = true }"
		@keydown="keydown"
	).dropdown-trigger
		span.dropdown-trigger-label {{selectedLabel}}
		<Icon :name="icon.name" :size="icon.size.toString()" class="dropdown-arrow"/>
	<DropdownWrap :expanded="expanded" :isEnd="isEnd">
		ul(:id="id" role="listbox" ref="dropdownList").dropdown-list
			li(v-for="(option, index) in dropdownOptions" ref="listItemOptions" class="dropdown-option" role="option" tabindex="0" :id="`${id}-${option.value}`" 
				:aria-posinset="index + 1" 
				:aria-setsize="dropdownOptions.length + 1" 
				:aria-selected="option.value == selectedValue ? 'true' : 'false'"
				@keydown.space.exact.prevent="spaceHit"
				@click="selectOption(option)"
				@keydown.enter.exact.prevent="selectOption(option)"
				@keydown.escape.exact.prevent="closeDropdown"
				@keydown.alt.up.exact.prevent="closeDropdown" 
				@keydown.alt.down.exact.prevent="closeDropdown"
				@keydown.tab.exact="closeDropdown"
				@keydown.shift.tab.exact="closeDropdown" 
				@keydown.up.exact.prevent="goUp"
				@keydown.down.exact.prevent="goDown"
				@keydown.home.exact.prevent="selectFirst" 
				@keydown.end.exact.prevent="selectLast"
				@keydown="keydown"
			)
				span.option-label {{option.label}}
				span(:aria-hidden="option.value == selectedValue ? 'false' : 'true'").sr-only , Selected
	</DropdownWrap>
</template>

<script setup lang="ts">
  import { onClickOutside, useScroll } from "@vueuse/core"
  import { vScroll } from "@vueuse/components"
  const isMobile = useTrollBreakpoints()?.smallerOrEqual("dropdown") ?? false

  const id = useId()
  const expanded = ref(false)
  const previouslySelected = ref("")
  const typedText = ref("")
  const lastTyped = ref<Date>(new Date())
  const wasReservedKey = ref(false)
  const wasSpace = ref(false)
  const test = ref("") //needed
  const isEnd = ref(false)
  const container = ref<null | HTMLDivElement>(null)
  const dropdownSelect = ref<null | HTMLSelectElement>(null)
  const dropdownTrigger = ref<null | HTMLButtonElement>(null)
  const dropdownList = ref<null | HTMLUListElement>(null)
  const listItemOptions = ref<null | HTMLLIElement[]>(null)
  const { arrivedState, y } = useScroll(dropdownList, { throttle: 200 })
  const { bottom } = toRefs(arrivedState)
  onClickOutside(container, () => (expanded.value = false))

  watch(y, () => {
    isEnd.value = bottom.value
  })

  const emit = defineEmits<{
    (e: "change", value: string): void
  }>()

  interface Option {
    label: string
    value: string
  }

  const defaultIcon = {
    name: "material-symbols:keyboard-arrow-down-rounded",
    size: "1.25em",
  }

  const props = withDefaults(
    defineProps<{
      options: Option[]
      label?: string
      icon?: Icon
    }>(),
    {
      label: "",
    }
  )
  const selectedValue = defineModel()

  const icon = useIconDefaults(props?.icon, defaultIcon)
  const iconSize = computed(() => icon.size)

  const { options: dropdownOptions, label } = toRefs(props)

  const selectedLabel = computed(() => {
    if (dropdownOptions.value === null) return ""
    return dropdownOptions.value.find(option => option.value == selectedValue.value)?.label ?? ""
  })

  function openDropdown(event: Event) {
    if (wasSpace.value) {
      spaceHit(event)
      return
    }
    expanded.value = true
    previouslySelected.value = selectedValue.value

    const index = dropdownOptions.value.findIndex(option => option.value == selectedValue.value)
    setTimeout(() => {
      listItemOptions.value[index].focus()
    }, 10)
  }
  function closeDropdown() {
    expanded.value = false
    wasReservedKey.value = false //this may not be great logic?

    setTimeout(() => {
      dropdownTrigger.value.focus()
    }, 1)
  }

  function spaceHit({ target }: Event) {
    wasSpace.value = false
    const typedTime = new Date()
    const difference = typedTime - lastTyped.value

    if (difference > 1000 || typedText.value.trim() === "") {
      wasReservedKey.value = true
      if (target.classList.contains("dropdown-trigger")) {
        !expanded.value ? openDropdown() : closeDropdown()
      } else {
        closeDropdown()
      }
    } else {
      wasReservedKey.value = false
    }
  }

  function focusDropdown() {
    if (isMobile) {
      dropdownSelect.value?.focus()
    } else {
      dropdownTrigger.value?.focus()
    }
  }

  function selectOption({ label, value }: Option) {
    selectedValue.value = value
    closeDropdown()
  }

  function setSelected(target: HTMLElement, index: number) {
    //event.preventDefault()
    selectedValue.value = dropdownOptions.value[index].value

    if (!target.classList.contains("dropdown-trigger")) {
      listItemOptions.value[index].focus()
    }
  }

  function goDown({ target }: Event) {
    wasReservedKey.value = true
    const index = dropdownOptions.value.findIndex(option => option.value == selectedValue.value)
    if (index + 1 >= dropdownOptions.value.length) return
    setSelected(target, index + 1)
  }

  function goUp({ target }: Event) {
    wasReservedKey.value = true
    const index = dropdownOptions.value.findIndex(option => option.value == selectedValue.value)
    if (index <= 0) return
    setSelected(target, index - 1)
  }

  function selectFirst({ target }: Event) {
    wasReservedKey.value = true
    setSelected(target, 0)
  }

  function selectLast({ target }: Event) {
    wasReservedKey.value = true
    setSelected(target, dropdownOptions.value.length - 1)
  }

  async function keydown(event: Event) {
    //this.test = event.key
    await wait(1)
    if (!wasReservedKey.value) {
      const key = event.key.toLowerCase()
      let duplicate = JSON.parse(JSON.stringify(dropdownOptions.value))
      const index = dropdownOptions.value.findIndex(option => option.value == selectedValue.value)
      let searchable = []
      const typedTime = new Date()
      const difference = typedTime - lastTyped.value

      if (difference < 1000) {
        typedText.value += key
        test.value = typedText.value
        searchable = [...duplicate.splice(index), ...duplicate]
      } else {
        typedText.value = key
        test.value = typedText.value
        searchable = [...duplicate.splice(index + 1), ...duplicate]
      }

      const foundItem = searchable.find(({ label }) =>
        label.toLowerCase().startsWith(typedText.value)
      )

      if (typeof foundItem !== "undefined") {
        selectedValue.value = foundItem.value
        const index = dropdownOptions.value.findIndex(option => option.value == selectedValue.value)
        listItemOptions.value[index].focus()
      }

      lastTyped.value = typedTime
    } else {
      typedText.value = ""
    }

    await wait(10)
    wasReservedKey.value = false
  }

  defineExpose({
    selectedValue,
    props,
  })
</script>

<style lang="scss" scoped>
  .custom-dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-trigger {
    --focus-offset: 2px;
    padding: var(--trigger-padding, 0.95em 1em 0.95em 1.5em);
    font-size: var(--trigger-font, 0.85em);
    letter-spacing: 0.075em;

    &:hover:not(:focus) {
      color: var(--trigger-hover-color, $dark-grey);
    }

    &[aria-expanded="true"] {
      & + .dropdown-outer-wrap {
        opacity: 1;
      }
    }

    &[aria-expanded="true"] {
      .dropdown-arrow {
        transform: rotate(180deg);
      }
    }

    @include viewport($dropdown-mobile-viewport down) {
      .custom-dropdown & {
        display: none;
      }
    }
  }

  .dropdown-arrow {
    width: v-bind(iconSize);
    height: v-bind(iconSize);
    margin-left: var(--arrow-left, 0.5em);
    display: block;
    transition: transform 0.275s ease-in-out;
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
    color: var(--dropdown-color, $grey);
    background-color: var(--dropdown-background, $grey);

    .dropdown-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: v-bind(iconSize);
      right: var(--dropdown-container-padding-right, 1em);
    }

    @include viewport($dropdown-mobile-viewport up) {
      #main & {
        display: none;
      }
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
    font-size: var(--trigger-font-size, 0.85em);
    letter-spacing: 0.075em;
    background-color: transparent;
    color: var(--dropdown-color, $grey);
  }

  .dropdown-list {
    & > li {
      //letter-spacing: 0.02em; //tt specific

      &[aria-selected="true"] {
        background-color: var(--option-selected-background, $grey);
        --focus-color: var(--option-selected-color, white);
      }

      &:not([aria-selected="true"]):hover {
        background-color: var(--option-hover-background, $dark-grey);
        color: var(--option-hover-color, white);
      }
    }
  }

  .dropdown-trigger,
  .dropdown-mobile-select-container {
    background-color: var(--dropdown-background, white);
    border: var(--dropdown-border, 1px solid $grey);
    color: var(--dropdown-color, $grey);
    text-align: left;
    position: relative;
    display: flex;
    width: 100%;
    align-items: center;
    transition: color $fast;
    justify-content: space-between;
    font-family: var(--trigger-font, arial);
    font-weight: var(--trigger-font-weight, inherit);
    font-size: var(--trigger-font-size, 0.85em);
    border-radius: var(--dropdown-border-radius, 1.75rem);
  }

  .dropdown-option {
    font-size: var(--option-size, 0.9em);
    color: var(--option-color, $grey);
  }

  .dropdown-inner-wrap {
    & > ul {
      & > li {
        color: var(--option-color, $grey);

        &:first-child {
          margin-top: 0.5rem;
        }
      }
    }
  }
</style>
