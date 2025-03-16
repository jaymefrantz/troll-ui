<template lang="pug">
  div(:class="labelPosition").toggle-container
    input(:id="id" :disabled="disabled" type="checkbox" v-model="boolean")
    label(:for="id").toggle-label
      span(v-if="labelPosition === 'top' || labelPosition === 'left'" v-html="text").toggle-text
      div.custom-toggle
        span(v-html="booleanLabel").custom-toggle-knob
      span(v-if="labelPosition === 'right'" v-html="text").toggle-text
</template>

<script setup lang="ts">
  const boolean = defineModel()
  type BooleanLabels = {
    [key: string]: string
  }

  const props = withDefaults(
    defineProps<{
      text: string
      disabled?: boolean
      id?: string
      booleanLabels?: BooleanLabels
      labelPosition?: string
    }>(),
    {
      disabled: false,
      labelPosition: "right",
      booleanLabels: {
        true: "",
        false: "",
      },
    }
  )

  const id = computed(() => {
    return props?.id || `Toggle-${useId()}`
  })

  const booleanLabel = computed(() => {
    return props.booleanLabels[boolean?.value.toString() ?? "false"]
  })

  defineExpose({
    props,
  })
</script>

<style lang="scss" scoped>
  .toggle-container {
    position: relative;
    display: inline-block;

    &:not(.left):has(input[type="checkbox"]:checked) {
      --toggle-knob-translate: 0;
    }

    &.left {
      --toggle-knob-translate: 0;

      &:has(input[type="checkbox"]:checked) {
        --toggle-knob-translate: 100%;
      }
    }
  }

  input[type="checkbox"] {
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
    z-index: 3;

    &:focus-visible {
      outline: none;

      & + label .custom-toggle {
        outline: var(--focus-weight) solid var(--focus-outline-color);
        outline-offset: var(--focus-offset);
      }
    }

    &[disabled] {
      cursor: not-allowed;
      & + label {
        opacity: 0.75;
      }
    }
  }

  .toggle-label {
    display: flex;
    gap: var(--toggle-gap, 0.65rem);
    transition: opacity $fast;

    .top & {
      flex-direction: column;
    }
  }

  .toggle-text {
  }

  .custom-toggle {
    position: relative;
    background: var(--toggle-background, $grey);
    border: var(--toggle-border, 1px solid $dark-grey);
    border-radius: var(--toggle-border-radius, 2rem);
    padding: var(--toggle-padding-y, 0.25rem) var(--toggle-padding-x, 0.25rem);
    width: var(--toggle-width, 2.5em);
    display: flex;
    align-items: center;
    transition: all $medium-fast;
  }

  .custom-toggle-knob {
    display: inline-block;
    width: var(--toggle-knob-width, 50%);
    background: var(--toggle-knob-background, white);
    border: var(--toggle-knob-border, $grey);
    border-radius: var(--toggle-knob-border-radius, 2rem);
    aspect-ratio: 1;
    transform: translateX(var(--toggle-knob-translate, 100%));
    transition: transform $medium-fast;
  }
</style>
