# Onorix

> Yet another NodeCG plugin for Vue.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Author](#author)
- [License](#license)

## Installation

```bash
npm install onorix
```

```javascript
import Vue from "vue";
import Onorix from "onorix";

Vue.use(Onorix);
```

## Usage

### Replicants

```javascript
const app = new Vue({
  replicants: {
    /**
     * Declares a `lorem` replicant.
     */
    lorem: {},

    /**
     * Declares a `dolor` replicant but accessible from `ipsum`.
     */
    ipsum: {
      name: "dolor",
    },

    /**
     * Declares a `sit` replicant with the given options.
     */
    sit: {
      defaultValue: "Spark",
      persistent: false,
    },

    /**
     * Declares a `amet` replicant from the `acta` namespace.
     */
    amet: {
      namespace: "acta",
    },
  },
  created() {
    console.log(this.$replicants.lorem);
  },
});
```

### Decorators

If prefer decorators, you can declare replicants with `@Replicant`.
The main difference with the previous example is that a computed property is being defined as well.

```javascript
import { Replicant } from "onorix";
import { Component, Vue } from "vue-property-decorators";

@Component
class App extends Vue {
  @Replicant() lorem;
  @Replicant({ name: "dolor" }) ipsum;
  @Replicant({ defaultValue: "Spark", persistent: false }) sit;
  @Replicant({ namespace: "acta" }) amet;

  created() {
    console.log(this.$replicants.lorem.value === this.lorem);
  }
}
```

## Author

Alexandre Breteau - [@0xSeldszar](https://twitter.com/0xSeldszar)

## License

MIT © [Alexandre Breteau](https://seldszar.fr)
