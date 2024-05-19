<template lang="pug">
transition(name="dropdown-outer-wrap")
  div(v-show="expanded" :class="{ 'end': isEnd }" ref="outer").dropdown-outer-wrap
    div(ref="wrap").dropdown-inner-wrap
      <slot/>
</template>

<script setup lang="ts">
  const wrap = ref<HTMLDivElement | null>(null)

  const props = defineProps<{
    expanded: boolean
    isEnd: boolean
  }>()

</script>

<style lang="scss">
  //add transition + css vars for transition timings and transforms
  .dropdown-outer-wrap {
    background-color: var(--dropdown-background, white);
    padding: var(--dropdown-outer-padding, 0.5em 0.35em);
    border-radius: var(--border-radius);
    border: var(--border);
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    z-index: 20;
    transition: all $medium-fast ease-in-out;
    margin-top: 0.5em;

    &-enter-from,
    &-leave-to {
      opacity: 0;
      translate: 0 -0.5em;
      //scale: 0.98;
    }


    &:after {
      content: "";
      position: absolute;
      bottom: 0.25em;
      left: 0.5em;
      width: calc(100% - 1.5em);
      height: 2.875em;
      background: var(--dropdown-gradient, linear-gradient(-180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%));
      transition: opacity 0.15s;
      opacity: 1;
      pointer-events: none;
    }

    &.end:after {
      opacity: 0;
    }
  }

  .dropdown-inner-wrap {
    padding: var(--dropdown-inner-padding, 0.35rem 0.35rem 0.25rem 0);

    & > ul {
      overflow-y: auto;

      & > li {
        cursor: pointer;
      }
    }
  }
</style>