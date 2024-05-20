<template lang="pug">
<Autocomplete ref="autocomplete" @selected="movie = $event" v-bind="{ label: 'Movies', placeholder: 'Search movies', items: movies, searchedProp: 'title', itemComponent  }" />
//- <Props :props="props" />
pre {{movie, null, "  "}}
div.options-container
  p.subtitle Sample options
  ul.options-list
    li(v-for="movie in useObjectSort(movies, 'title')" :key="movie.id") {{ movie.title }}
</template>

<script setup lang="ts">
  interface Movie {
    id: number
    title: string
    posterURL: string
    imdbId: string
  }
  const autocomplete = ref(null)
  const { data: movies } = await useFetch("https://api.sampleapis.com/movies/comedy")
  const itemComponent = resolveComponent("AutocompleteItem")
  const props = computed(() => Object.keys(autocomplete.value?.props ?? {}))
  const movie = ref<null | Movie>(null)
</script>

<style lang="scss">
  .autocomplete-container {
    max-width: 30rem;
    --focus-color: var(--dark-200);
  }

  .autocomplete-input-wrap:focus-within {
    outline-color: var(--primary) !important;
  }

  .autocomplete-results-list > li {
    border-radius: 0.2em; 
  }

  * + .options-container {
    margin-top: 3em;
  }

  .options-list {
    column-count: var(--column, 1);
    margin: 0 -0.875rem;

    @include viewport($medium-small-viewport up) {
      --column: 2;
    }

    @include viewport($medium-large-viewport up) {
      --column: 3;
    }

    @include viewport($extra-large-viewport up) {
      --column: 4;
    }

    & > li {
      font-size: 0.875em;
      line-height: 1.6;
      padding: 0.35rem 0.875rem;
    }
  }

</style>