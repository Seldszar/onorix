import { VueDecorator, createDecorator } from "vue-class-component";

import { mapReplicants, ReplicantDescriptor } from ".";

/**
 * Decorator for declaring a replicant as computed property.
 * @param name the replicant name
 * @param options the replicant options
 */
export function Replicant<V>(descriptor: ReplicantDescriptor<V> = {}): VueDecorator {
  return createDecorator((componentOptions, key): void => {
    if (componentOptions.replicants == null) {
      componentOptions.replicants = {};
    }

    if (componentOptions.computed == null) {
      componentOptions.computed = {};
    }

    Object.assign(componentOptions.computed, mapReplicants([key]));
    Object.assign(componentOptions.replicants, {
      [key]: descriptor,
    });
  });
}
