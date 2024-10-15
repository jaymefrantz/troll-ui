<template lang="pug">
  nuxt-link(:to="to").nav-link
    div.icon-container
      //- <Icon class="icon" size="24" :name="`material-symbols-light:keyboard-double-arrow-right-rounded`"/>
    span.text {{ label }}
</template>

<script setup lang="ts">
  const props = defineProps<{
    to: string
    label: string
    direction: string
  }>()

  const icon = computed(() => {
    return props.direction === "right" ? "keyboard-double-arrow-right-rounded" : "keyboard-double-arrow-left-rounded"
  })
</script>

<style lang="scss" scoped>

  .nav-link {
    padding: 1em 1.5em;
    border: var(--border);
    border-radius: var(--border-radius);
    font-size: 1.25em;
    color: var(--dark-200);
    text-decoration: none;
    width: 100%;
    transition: background-color $medium-fast;
    display: block;

    &:hover {
      background-color: var(--dark-800);

      .icon-container {
        border-color: var(--primary);
        color: var(--primary);

        &:before {
          background-color: var(--primary);
        }
      }
    }
  }


  .icon-container {
    position: relative;
    color: var(--near-white);
    transition: all $fast;
    border-radius: 100%;
    border: 1px solid var(--dark-600);
    overflow: hidden;
    height: 2.5rem;
    width: 2.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:before {
      content: "";
      background-color: var(--dark-800);
      opacity: 0.15;
      position: absolute;
      inset: 0;
      z-index: 0;
      transition: background-color $fast;
    }
  }

  .icon {
    position: relative;
    z-index: 1;
  }

  .text {
    display: block;
    font-weight: 500;
  }
</style>