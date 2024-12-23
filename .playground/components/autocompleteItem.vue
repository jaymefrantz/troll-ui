<template lang="pug">
  div.autocomplete-item
    div.image-container
      img(:src="posterURL" :alt="title")
    div.text-container 
      p id: {{ id }}
      h2 {{ title }}
</template>

<script setup lang="ts">
  defineProps<{
    title: string
    id: number
    posterURL: string
    imdbId: string
  }>()
</script>

<style lang="scss" scoped>
  .autocomplete-item {
    display: flex;
    padding: 1rem;
    border-radius: 0.25rem;
    overflow: hidden;
    // margin: -1rem;
  }

  :global(.autocomplete-results-list > li) {
    border-radius: 0.5rem;
    //overflow: hidden;
  }

  :global(.autocomplete-results-list > li + li) {
    border-top: 1px solid var(--dark-800);
    //padding-top: 1rem;
    //margin-top: 2rem;
  }

  .image-container {
    width: 7rem;
    margin-right: 1em;

    img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      display: block;
    }
  }
</style>
