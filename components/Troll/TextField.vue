<template lang="pug">
  div.textbox-container
    label(v-if="label !== ''" :for="id" v-html="label").textbox-label.default-label
    div(:class="clickFocused ? 'click-focused' : ''").textbox-wrap
      <slot name="before"></slot>
      span(v-if="icon !== ''" v-html="icon").textbox-icon-container
      input(:type="type" ref="textBox" v-bind="attrs" :id="id" v-model="value" :placeholder="placeholder" @click="clickFocused = true" @mousedown="mouseDown = true").textbox-input
      <slot name="after"></slot>
</template>

<script setup lang="ts">
  const value = defineModel()
  const textBox = ref<HTMLInputElement | null>(null)
  const { focused } = useFocus(textBox)
  const isHovering = useElementHover(textBox)
  const mouseDown = ref(false)
  const clickFocused = ref(false)

  const props = withDefaults(
    defineProps<{
      placeholder?: string
      label?: string
      id?: string
      type?: string
      icon?: string
      attrs?: Record<string, any>
    }>(),
    {
      placeholder: "",
      label: "",
      type: "text",
      icon: "",
      attrs: {},
    }
  )

  const id = computed(() => {
    return props?.id || `TextBox-${useId()}`
  })

  watch(focused, isFocused => {
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
    focused,
    isHovering,
    clickFocused,
    el: textBox,
  })
</script>

<style lang="scss" scoped>
  .textbox-label {
    color: var(--textbox-label-color, currentColor);
  }

  .textbox-wrap {
    position: relative;
    &:hover:not(:focus-within):not([disabled]) .textbox-input {
      color: var(--textbox-hover-color, $dark-grey);
      border-color: var(--textbox-hover-border-color, $grey);
    }
  }

  .textbox-icon-container {
    width: var(--textbox-icon-size, 1.5rem);
    position: absolute;
    left: var(--textbox-padding-x, 0.5rem);
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
  }

  .textbox-input {
    background: var(--textbox-background, transparent);
    border: var(--textbox-border, 1px solid $grey);
    border-radius: var(--textbox-border-radius, 0.25rem);
    color: var(--textbox-color, $dark-grey);
    font-size: var(--textbox-font-size, 1rem);
    font-family: var(--textbox-font, inherit);
    font-weight: var(--textbox-weight, 400);
    padding: var(--textbox-padding-y, 0.5rem) var(--textbox-padding-x, 0.5rem);
    transition: color 0.2s ease-in-out, border-color 0.2s ease-in-out;
    width: 100%;

    .textbox-wrap:has(.textbox-icon-container) & {
      padding-left: calc(
        var(--textbox-padding-x, 0.5rem) + var(--textbox-icon-size, 1.5rem) +
          var(--textbox-icon-padding, 1rem)
      );
    }

    #main &:-internal-autofill-selected,
    #main &:-webkit-autofill,
    #main &:is(:-webkit-autofill, :autofill) {
      -webkit-box-shadow: 0 0 0px 1000px var(--textbox-background, transparent) inset;
      -webkit-text-fill-color: var(--textbox-color, $dark-grey);
    }

    &[disabled] {
      cursor: not-allowed;
    }
  }
</style>
