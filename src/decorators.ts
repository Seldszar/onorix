import { ReplicantOptions } from "nodecg/types/browser";
import { VueDecorator, createDecorator } from "vue-class-component";

import { mapReplicants, ReplicantDescriptor } from ".";

/**
 * Decorator for declaring a replicant as computed property.
 * @param descriptor the replicant descriptor
 */
export function Replicant<V>(name: string, options?: ReplicantOptions<V>): VueDecorator;
export function Replicant<V>(
  name: string,
  namespace: string,
  options?: ReplicantOptions<V>,
): VueDecorator;
export function Replicant<V>(descriptor?: ReplicantDescriptor<V>): VueDecorator;
export function Replicant<V>(
  name?: string | ReplicantDescriptor<V>,
  namespace?: string | ReplicantOptions<V>,
  options?: ReplicantOptions<V>,
): VueDecorator {
  if (typeof name === "object") {
    return Replicant(name.name, name.namespace, name);
  }

  if (typeof namespace === "object") {
    return Replicant(name, undefined, namespace);
  }

  return createDecorator((componentOptions, key): void => {
    if (componentOptions.replicants == null) {
      componentOptions.replicants = {};
    }

    if (componentOptions.computed == null) {
      componentOptions.computed = {};
    }

    if (componentOptions.watch == null) {
      componentOptions.watch = {};
    }

    Object.assign(componentOptions.computed, mapReplicants([key]));
    Object.assign(componentOptions.replicants, {
      [key]: { ...options, name, namespace },
    });

    const watch: unknown = componentOptions.watch;

    if (watch[key] == null) {
      watch[key] = [];
    }

    if (!Array.isArray(watch[key])) {
      watch[key] = [watch[key]];
    }

    watch[key].push({
      deep: true,
      handler(this: Vue, newValue: V, oldValue: V): void {
        if (newValue !== oldValue) {
          return;
        }

        this[key] = newValue;
      },
    });
  });
}
