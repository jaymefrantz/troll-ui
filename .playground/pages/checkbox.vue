<template lang="pug">
  <checkbox :icon="icon" text="Disabled" v-model="disabled"/>
  p Selected checkboxes: {{ activeCheckboxes.length > 0 ? activeCheckboxes.join(', ') : "none"}}
  ul.checkbox-list
    li(v-for="checkbox in checkboxes" :key="checkbox")
      <checkbox :text="checkbox" :icon="icon" :id="checkbox" :disabled="disabled" v-model="activeCheckboxes" />
</template>

<script setup lang="ts">
  const activeCheckboxes = ref<string[]>(["two"])
  const checkboxes = ref<string[]>(["one", "two", "three"])
  const disabled = ref(false)

  const icon = {
    name: "material-symbols:check",
    size: "1.35em",
  }
</script>

<style lang="scss" scoped>
  .checkbox-container {
    --checkbox-background: transparent;
    --checkbox-border: var(--border);
    --checkbox-border-radius: 0.15rem;
    --checkbox-color: var(--dark-200);
    --checkbox-icon-y: 50%;
    --checkbox-icon-x: calc(50% + 0.05em);

    &:has(input[type="checkbox"]:checked) {
      --checkbox-background: var(--primary);
      --checkbox-border: 1px solid var(--primary);
    }

    &:has(input[type="checkbox"]:not(:checked):not([disabled]):hover) {
      --checkbox-border: 1px solid var(--primary);
      & :deep(.checkbox) {
        box-shadow: 0 0 0 1px var(--primary);
      }
    }

    &:has(input[type="checkbox"][disabled]:checked) {
      --checkbox-background: var(--dark-400);
      --checkbox-border: 1px solid var(--dark-400);
      --checkbox-color: var(--dark-200);
      color: var(--dark-400);
    }

    &:has(input[type="checkbox"][disabled]:not(:checked)) {
      --checkbox-color: var(--dark-400);
      --checkbox-border: 1px solid var(--dark-400);
      color: var(--dark-400);
    }
  }

  .checkbox-list {
    & > li + li {
      margin-top: 0.25em;
    }
  }
</style>
