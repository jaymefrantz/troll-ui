<template lang="pug">
  div.textbox-container
    label(v-if="label !== ''" :for="id" v-html="label").textbox-label.default-label
    div.textbox-wrap
      <slot name="before"></slot>
      span(v-if="icon !== ''" v-html="icon").textbox-icon-container
      input(:type="type" v-bind="attrs" :id="id" v-model="value" :placeholder="placeholder").textbox-input
      <slot name="after"></slot>
</template>

<script setup lang="ts">
  const value = defineModel()
  const attrs = useAttrs()

  const props = withDefaults(
    defineProps<{
      placeholder?: string
      label?: string
      id?: string
      type?: string
      icon?: string
    }>(),
    {
      placeholder: "",
      label: "",
      type: "text",
      icon: "",
    }
  )

  const id = computed(() => {
    return props?.id || `TextBox-${useId()}`
  })

  defineExpose({
    props,
  })
</script>

<style lang="scss" scoped>
  .textbox-label {
    color: var(--textbox-label-color, currentColor);
  }

  .textbox-wrap {
    position: relative;
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
