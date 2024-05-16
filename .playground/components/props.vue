<template lang="pug">
div.props-container
  p.subtitle Props
  ul.props-list
    li(v-for="prop in props" :key="prop") {{ prop }}
</template>

<script setup lang="ts">

  defineProps<{
    props?: string[]
  }>()
</script>

<style lang="scss" scoped>
.props-container {
  margin-top: 3em;
}
.props-list {
  background-color: var(--dark-800);
  padding: 1em;
  margin-top: 1em;
  border-radius: 0.15em;
  font-family: courier, monospace;
  letter-spacing: 0.1px;

  & > li + li {
    margin-top: 0.75em;
  }
}

</style>