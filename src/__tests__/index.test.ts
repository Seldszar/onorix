import { shallowMount } from "@vue/test-utils";
import { EventEmitter } from "events";
import { ReplicantOptions, ReplicantBrowser } from "nodecg/types/browser";
import Component from "vue-class-component";
import Vue from "vue";

import Onorix, { mapReplicants, Replicant } from "..";

const declaredReplicants = new Map();

beforeAll(() => {
  Vue.config.productionTip = false;

  class TestReplicant<T> extends EventEmitter {
    status = "declaring";
    rawValue = undefined;

    get value(): T {
      return this.rawValue;
    }

    set value(value: T) {
      this.rawValue = value;

      setTimeout(() => {
        this.emit("change", value);
      });
    }

    constructor(
      readonly name: string,
      readonly namespace: string,
      readonly opts: ReplicantOptions<T> = {},
    ) {
      super();

      this.on("newListener", (eventName, listener) => {
        if (this.status === "declared" && eventName === "change") {
          listener(this.value);
        }
      });

      this.on("change", newValue => {
        this.value = newValue;
      });

      setTimeout(() => {
        if (this.status === "declared") {
          return;
        }

        this._declare(opts.defaultValue);
      });
    }

    _declare(value: T): void {
      this.status = "declared";
      this.emit("change", value);
    }
  }

  global["NodeCG"] = {
    async waitForReplicants(...replicants: ReplicantBrowser<unknown>[]): Promise<void> {
      await Promise.all(
        replicants.map(replicant => new Promise(resolve => replicant.once("change", resolve))),
      );
    },
  };

  global["nodecg"] = {
    Replicant<T>(
      name: string,
      namespace?: string | ReplicantOptions<T>,
      options?: ReplicantOptions<T>,
    ): TestReplicant<T> {
      if (typeof namespace === "object") {
        return this.Replicant(name, undefined, namespace);
      }

      let replicant = declaredReplicants.get(`${namespace}:${name}`);

      if (replicant == null) {
        declaredReplicants.set(
          `${namespace}:${name}`,
          (replicant = new TestReplicant(name, namespace, options)),
        );
      }

      return replicant;
    },
  };

  Vue.use(Onorix);
});

beforeEach(() => {
  declaredReplicants.clear();
});

describe("onorix", () => {
  it("should expose the NodeCG instance", async () => {
    const { vm } = shallowMount(Vue, {
      render: h => h(),
    });

    expect(Vue.nodecg).toBeDefined();
    expect(vm.$nodecg).toBeDefined();
  });

  it("should declare replicants", async () => {
    const { vm } = shallowMount(Vue, {
      render: h => h(),
      replicants: {
        hello: {
          defaultValue: "spark",
        },
        bye: {
          name: "cya",
        },
        data: {
          defaultValue: {
            lorem: {
              ipsum: ["dolor", new Date()],
            },
          },
        },
      },
    });

    expect(vm.$options.replicants.hello).toBeDefined();
    expect(vm.$replicants.hello).toBeDefined();

    expect(vm.$replicants.hello.value).toBe("spark");
    expect(vm.$replicants.bye.name).toBe("cya");
  });

  it("should include replicants as computed values", async () => {
    const { vm } = shallowMount(Vue, {
      render: h => h(),
      replicants: {
        hello: {},
        bye: {
          defaultValue: "spark",
        },
      },
      computed: {
        ...mapReplicants(["hello"]),
        ...mapReplicants({ cya: "bye" }),
      },
    });

    expect(vm.$options.computed.hello).toBeDefined();
    expect(vm.$options.computed.cya).toBeDefined();
    expect(vm).toHaveProperty("hello", undefined);
    expect(vm).toHaveProperty("cya", "spark");
  });

  it("should declare replicants via decorators", async () => {
    @Component
    class App extends Vue {
      @Replicant() hello!: unknown;
      @Replicant({ name: "bye", defaultValue: "spark" }) cya!: unknown;
      @Replicant("bip", { defaultValue: 1 }) boop!: unknown;
    }

    const { vm } = shallowMount(App, {
      render: h => h(),
    });

    expect(vm.$options.computed.hello).toBeDefined();
    expect(vm.$options.computed.cya).toBeDefined();
    expect(vm).toHaveProperty("hello", undefined);
    expect(vm).toHaveProperty("cya", "spark");
    expect(vm).toHaveProperty("boop", 1);
  });

  it("should handle replicant updates", async () => {
    expect.assertions(1);

    return new Promise((resolve, reject) => {
      shallowMount(Vue, {
        render: h => h(),
        replicants: {
          hi: {
            defaultValue: "spark",
          },
        },
        created(this: Vue): void {
          this.$watch("$replicants.hi.value", newValue => {
            try {
              expect(newValue).toBe("seldszar");
            } catch (error) {
              reject(error);
            }

            resolve();
          });

          this.$replicants.hi._declare("seldszar");
        },
      });
    });
  });

  it("should update replicant from computed", async () => {
    expect.assertions(1);

    return new Promise((resolve, reject) => {
      shallowMount(Vue, {
        render: h => h(),
        replicants: {
          hello: {},
        },
        computed: {
          ...mapReplicants(["hello"]),
        },
        created(this: Vue): void {
          this.$watch("hello", newValue => {
            try {
              expect(newValue).toBe("spark");
            } catch (error) {
              reject(error);
            }

            resolve();
          });

          this["hello"] = "spark";
        },
      });
    });
  });

  it("should declare replicants from the wrapped NodeCG instance", async () => {
    expect.assertions(2);

    return new Promise(resolve => {
      const bleep = Vue.nodecg.Replicant("sound", {
        defaultValue: "bleep",
      });

      bleep.on("change", newValue => {
        expect(newValue).toBe("bloop");
        resolve();
      });

      expect(bleep.value).toBe("bleep");
      bleep._declare("bloop");
    });
  });

  it("should wait until children replicants are declared", async () => {
    @Component
    class App extends Vue {
      @Replicant() bye!: unknown;
    }

    return new Promise(resolve => {
      shallowMount(Vue, {
        render: h => h(App),
        replicants: {
          hello: {},
        },
        async mounted(this: Vue) {
          expect(await this.$waitForReplicants()).toBeUndefined();
          resolve();
        },
      });
    });
  });

  it("should handle declared replicants", () => {
    nodecg.Replicant("type")._declare("moa");

    expect(Vue.nodecg.Replicant("type").value).toBe("moa");
  });
});
