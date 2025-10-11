<template lang="pug">
  div(:class="family").icon-container
    <Icon v-if="name" :name="name" :size="size"/>
    <component v-else-if="componentName !== undefined" :is="componentName" aria-hidden="true" role="img" class="icon"/>
    <span v-if="label" class="icon-text" v-html="label"></span>
</template>

<script setup lang="ts">
  const props = defineProps({
    label: {
      type: String,
    },
    name: {
      type: String,
    },
    size: {
      type: String,
      default: "none",
    },
    color: {
      type: String,
      default: "currentColor",
    },
    componentName: {
      type: String,
    },
  })

  const family = computed(() => (props.name !== undefined ? props?.name.split(":")[0] : null))
</script>

<style lang="scss" scoped>
  .icon-container {
    display: flex;
    &:has(.icon-text) {
      align-items: var(--icon-align, center);
      gap: var(--icon-gap, 0.5em);
    }
  }

  .icon-text {
    flex: 1 1 auto;
    display: block;
  }

  .icon {
    flex-shrink: 0;
    width: var(--icon-size, 1em);
    height: var(--icon-size, 1em);
  }
</style>
