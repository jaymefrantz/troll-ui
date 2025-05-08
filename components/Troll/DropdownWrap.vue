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
  .dropdown-outer-wrap {
    background-color: var(--dropdown-background, white);
    padding: var(--dropdown-outer-padding, 0.5em 0.35em);
    border-radius: var(--dropdown-border-radius);
    border: var(--dropdown-border);
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    z-index: 20;
    transition: all var(--transition-duration, $medium-fast) ease-in-out;
    margin-top: 0.5em;

    &-enter-from,
    &-leave-to {
      opacity: 0;
      transform: var(--transform, translate(0 -0.5em));
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
      max-height: var(--dropdown-height, 10rem);

      &::-webkit-scrollbar {
        width: var(--scollbar-width, 5px); 
      }

      &::-webkit-scrollbar-thumb {
        background: var(--scrollbar-color, $grey);
      }

      & > li {
        cursor: pointer;
        padding: var(--option-padding, 0.2em 0.75em 0.15em);
        margin: var(--option-margin, 0.2em 0.35em 0.2em 0.1em);
        transition: var(--option-transition, all 0.15s ease-in-out);
        color: var(--option-color, $grey);
      }
    }
  }
</style>