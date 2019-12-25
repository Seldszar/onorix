import { NodeCGBrowser, ReplicantBrowser, ReplicantOptions } from "nodecg/types/browser";
import Vue, { ComputedOptions, VueConstructor } from "vue";

/**
 * Clones a value.
 * @param value the value
 */
export function clone<T>(value: T): T {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  if (value instanceof Date) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Date(value) as any;
  }

  if (Array.isArray(value)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return value.map(clone) as any;
  }

  const cloned = {} as T;

  for (const key in value) {
    cloned[key] = clone(value[key]);
  }

  return cloned;
}

/**
 * Map replicants as computed.
 * @param keys the replicant keys
 */
export function mapReplicants<T extends string>(map: T[]): { [K in T]: ComputedOptions<unknown> };
export function mapReplicants<T extends Record<string, string>>(
  map: T,
): { [K in keyof T]: ComputedOptions<unknown> };
export function mapReplicants(map: unknown): object {
  const result = {};

  if (Array.isArray(map)) {
    map.forEach(key => {
      result[key] = key;
    });

    return mapReplicants(result);
  }

  for (const [key, name] of Object.entries(map)) {
    result[key] = {
      get(this: Vue): unknown {
        return this.$replicants[name].value;
      },
      set(this: Vue, value: unknown): void {
        this.$replicants[name].value = value;
      },
    };
  }

  return result;
}

/**
 * Creates a replicant compatible with Vue.
 * @param Vue the Vue instance
 * @param replicant the replicant
 */
export function createReplicant(
  Vue: VueConstructor<Vue>,
  name: string,
  options?: ReplicantOptions<unknown>,
): ReplicantBrowser<unknown>;
export function createReplicant(
  Vue: VueConstructor<Vue>,
  name: string,
  namespace: string,
  options?: ReplicantOptions<unknown>,
): ReplicantBrowser<unknown>;
export function createReplicant(
  Vue: VueConstructor<Vue>,
  name: string,
  namespace?: string | ReplicantOptions<unknown>,
  options: ReplicantOptions<unknown> = {},
): ReplicantBrowser<unknown> {
  if (typeof namespace === "object") {
    return createReplicant(Vue, name, undefined, namespace);
  }

  const replicant = nodecg.Replicant(name, namespace, options);
  const state = Vue.observable({
    value: clone(replicant.status === "declared" ? replicant.value : options.defaultValue),
  });

  replicant.on("change", newValue => {
    state.value = clone(newValue);
  });

  return new Proxy(replicant, {
    get(target, property, receiver): unknown {
      if (property === "value") {
        return state.value;
      }

      return Reflect.get(target, property, receiver);
    },
  });
}

/**
 * Wraps a NodeCG instance to make it compatible with Vue.
 * @param Vue the Vue instance
 * @param nodecg the NodeCG instance
 */
export function wrapNodeCG(Vue: VueConstructor<Vue>, nodecg: NodeCGBrowser): NodeCGBrowser {
  return new Proxy(nodecg, {
    get(target, property, receiver): unknown {
      if (property === "Replicant") {
        return createReplicant.bind(undefined, Vue);
      }

      return Reflect.get(target, property, receiver);
    },
  });
}
