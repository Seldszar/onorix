# Onorix

> Yet another NodeCG plugin for Vue.js 3.x

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Author](#author)
- [License](#license)

## Installation

```bash
npm install onorix@next
```

## Usage

### Replicant

You can define replicants in `setup()` by calling `replicant()`.

```typescript
import { replicant } from "onorix";
import { defineComponent } from "vue";

const Component = defineComponent({
  setup() {
    const hello = replicant("hello", {
      defaultValue: "Hello World",
    });

    return {
      hello,
    };
  },
});
```

You can also call `replicantAsync()` in order to wait until the replicant is defined before mounting the component.
This approach can be useful if you want to use `<Suspense />`.

```typescript
import { replicantAsync } from "onorix";
import { defineComponent } from "vue";

const Component = defineComponent({
  async setup() {
    const hello = await replicantAsync("hello", {
      defaultValue: "Hello World",
    });

    return {
      hello,
    };
  },
});
```

If you want to retrieve a replicant value once, you can use `readReplicant()` and `readReplicantAsync()`.
Their usage is the same as previously explained but the value will be readonly and not be updated.

### Message Listener

If you want to listen to messages from NodeCG, you can use `listenFor()` in `setup()`.

```typescript
import { listenFor } from "onorix";
import { defineComponent, reactive } from "vue";

const Component = defineComponent({
  async setup() {
    const list = reactive([]);

    listenFor("newItem", (item) => {
      list.push(item);
    });

    return {
      list,
    };
  },
});
```

## Author

Alexandre Breteau - [@0xSeldszar](https://twitter.com/0xSeldszar)

## License

MIT © [Alexandre Breteau](https://seldszar.fr)
