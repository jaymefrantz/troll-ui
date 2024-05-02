<script setup lang="ts">
const { myLayer } = useAppConfig();
</script>

<template>
  <div>
    <h1>Hello World!</h1>
    <pre>{{ myLayer }}</pre>
  </div>
</template>
<style lang="scss">
// body {
//   @include tmp;
//   background: $yellow;
// }
</style>
