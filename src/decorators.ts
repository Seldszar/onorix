import { VueDecorator, createDecorator } from "vue-class-component";

import { mapReplicants, ReplicantDescriptor } from ".";

/**
 * Decorator for declaring a replicant as computed property.
 * @param descriptor the replicant descriptor
 */
export function Replicant<V>(descriptor: ReplicantDescriptor<V> = {}): VueDecorator {
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
      [key]: descriptor,
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
