<template lang="pug">
ul.dropdowns
  li
    <TrollDropdown v-model="yearSelection" class="year-dropdown" ref="yearDropdown" :options="yearOptions" label="Year" :icon="{ size: '1.35em' }" />
    clientOnly
      p selected year: {{ yearSelection }}
  li
    <TrollDropdown v-model="cheeseSelection" class="cheese-dropdown" ref="cheeseDropdown" :options="cheeses" label="Cheese"/>
    clientOnly
      p selected cheese: {{ cheeseSelection }}
<Props :props="props" />
</template>

<script setup lang="ts">
  const yearDropdown = ref(null)
  const cheeseDropdown = ref(null)
  const cheeseSelection = ref("SmellyCheese")
  const yearSelection = ref("")

  const yearOptions = [
    { label: "Any year", value: "" },
    { label: "2024", value: "2024" },
    { label: "2023", value: "2023" },
    { label: "2022", value: "2022" },
    { label: "2021", value: "2021" },
    { label: "2020", value: "2020" },
    { label: "2019", value: "2019" },
    { label: "2018", value: "2018" },
    { label: "2017", value: "2017" },
    { label: "2016", value: "2016" },
    { label: "2015", value: "2015" },
    { label: "2014", value: "2014" },
    { label: "2013", value: "2013" },
  ]

  const cheeses = [
    "Queso",
    "Feta",
    "Cottage Cheese",
    "Cheddar",
    "Pepper Jack",
    "Mozzarella",
    "Smelly Cheese",
    "Pecorino",
    "Parmesan",
  ].map(cheese => ({ label: cheese, value: cheese.split(" ").join("") }))
  const props = computed(() => Object.keys(yearDropdown.value?.props ?? {}))
  const cssVars = [
    "--trigger-padding",
    "--trigger-font",
    "--trigger-font-weight",
    "--trigger-hover-color",
    "--trigger-font-size",
    "--arrow-left",
    "--dropdown-color",
    "--dropdown-background",
    "--dropdown-container-padding-right",
    "--dropdown-height",
    "--option-color",
    "--option-size",
    "--option-padding",
    "--option-margin",
    "--option-selected-background",
    "--option-hover-background",
    "--option-hover-color",
    "--dropdown-border",
    "--dropdown-border-radius",
    "--dropdown-outer-padding",
    "--dropdown-inner-padding",
    "--scollbar-width",
    "--scrollbar-color",
  ]
</script>

<style lang="scss">
  .dropdowns {
    & > li {
      & + li {
        padding-top: 2em;
        margin-top: 3em;
        border-top: var(--border);
      }
    }
  }

  .custom-dropdown {
    --focus-offset: 0.05rem;
    //background-color: var(--dark-800);
  }

  .year-dropdown {
    width: 8.25em;
  }

  .cheese-dropdown {
    width: 12em;
  }

  .dropdown-inner-wrap::-webkit-scrollbar-thumb {
    border-radius: 5px;
  }

  .dropdown-trigger,
  .dropdown-mobile-select-container {
    transition: background-color $medium;

    &:hover {
      background-color: var(--dark-800);
    }
  }

  // .dropdown-select-input {
  //   border-radius: 1.75rem;
  // }
  // //--option-hover-background: $lightest-magenta
  // // --option-selected-background: map-get($magenta, shadow)
  // //need font weight
  // .dropdown-mobile-select-container {
  //   padding-right: 2rem;
  //   padding-left: 0.25rem;
  // }

  .dropdown-list > li {
    border-radius: 0.2em;
  }
</style>
