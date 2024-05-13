<template lang="pug">
ul.dropdowns
  li
    clientOnly
      p selected year: {{ yearDropdown.value }}
    <Dropdown class="year-dropdown" ref="yearDropdown" :options="yearOptions" label="Year" iconSize="1.35em" />
  li
    clientOnly
      p selected cheese: {{ cheeseDropdown.value }}
    <Dropdown class="cheese-dropdown" ref="cheeseDropdown" :options="cheeses" override="SmellyCheese" label="Cheese" iconSize="1.35em" />
</template>

<script setup lang="ts">
  const yearDropdown = ref(null)
  const cheeseDropdown = ref(null)

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

  const cheeses = ["Queso", "Feta", "Cottage Cheese", "Cheddar", "Pepper Jack", "Mozzarella", "Smelly Cheese", "Pecorino", "Parmesan"].map(cheese => ({ label: cheese, value: cheese.split(" ").join("") }))
  
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
    --dropdown-border: var(--border);
    --dropdown-background: var(--site-background);
    --dropdown-color: var(--grey-200);
    --dropdown-border-radius: 0.2rem;
    --trigger-font-weight: 500;
    --focus-outline-color: var(--primary);
    --trigger-hover-color: var(--grey-200);
    --scrollbar-color: var(--grey-600);
    --option-color: var(--grey-200);
    --option-selected-background: var(--primary);
    --option-hover-background: var(--grey-800);
    --focus-offset: 0.05rem;
    
    //background-color: var(--grey-800);
  }

  .year-dropdown {
    width: 8.25em;
  }

  .cheese-dropdown {
    width: 12em;
  }

  .default-label {
    --label-size: 0.875em;
    font-weight: 600;
    text-transform: uppercase;
    //margin-left: 1em; //tt style
  }

.dropdown-inner-wrap::-webkit-scrollbar-thumb {
  border-radius: 5px;
}

.dropdown-outer-wrap {
  border-radius: var(--border-radius);
  border: var(--border);
  
  &:after {
    background: linear-gradient(-180deg, rgba(255, 255, 255, 0) 0%, rgba(#18181b, 1) 100%) !important;
  }
}

.dropdown-trigger, .dropdown-mobile-select-container {
  transition: background-color $medium;

  &:hover {
    background-color: var(--grey-800);
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