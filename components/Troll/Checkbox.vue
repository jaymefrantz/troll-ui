<template lang="pug">
  div.checkbox-container
    input(:id="id" checked :disabled="disabled" :value="id" type="checkbox" v-model="checkboxes")
    label(:for="id").checkbox-label
      span.checkbox
        Icon(:name="icon.name" :size="icon?.size?.toString() ?? 'none'" class="checkbox-icon")
      span(v-html="text").checkbox-text
</template>

<script setup lang="ts">
  const checkboxes = defineModel()
  const props = withDefaults(
    defineProps<{
      text: string
      disabled?: boolean
      id?: string
      icon?: Icon
    }>(),
    {
      disabled: false,
      icon: {
        name: "fluent-emoji-high-contrast:check-mark",
        size: "1em",
      },
    }
  )

  const iconSize = computed(() => icon.size)

  const id = computed(() => {
    return props?.id || `Checkbox-${useId()}`
  })

  defineExpose({
    props,
  })
</script>

<style lang="scss" scoped>
  .checkbox-container {
    position: relative;
    display: inline-block;
  }

  .checkbox-label {
    display: inline-flex;
    align-items: center;
    gap: var(--checkbox-gap, 0.65em);
    cursor: pointer;

    .checkbox-container:has(input[type="checkbox"]:disabled) & {
      cursor: not-allowed;
    }
  }

  input[type="checkbox"] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;

    .checkbox-container:has(input[type="checkbox"]:disabled) & {
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: none;

      & + label .checkbox {
        outline: var(--focus-weight) solid var(--focus-outline-color);
        outline-offset: calc(var(--focus-offset) + 0.05rem);
      }
    }
  }

  .checkbox {
    background: var(--checkbox-background, transparent);
    border: var(--checkbox-border, 1px solid $grey);
    border-radius: var(--checkbox-border-radius, 0.25rem);
    color: var(--checkbox-color, $dark-grey);
    position: relative;
    width: var(--checkbox-size, 1.5rem);
    height: var(--checkbox-size, 1.5rem);
    display: inline-flex;
    transition: var(--checkbox-transition, all $medium-fast ease-in-out);

    .checkbox-container:has(input[type="checkbox"]:checked) & {
      .checkbox-icon {
        opacity: 1;
        scale: 1;
      }
    }
  }

  .checkbox-icon {
    position: absolute;
    top: var(--checkbox-icon-y, 50%);
    left: var(--checkbox-icon-x, 50%);
    translate: var(--checkbox-icon-position, -50% -50%);
    opacity: 0;
    scale: 0.5;
    transition: var(--checkbox-icon-transition, all $medium-fast ease-in-out);
  }
</style>
