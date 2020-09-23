/* global nodecg */

import {shallowRef, Ref, readonly} from 'vue';

function readReplicant<T>(name: string, namespace?: string): Ref<T | undefined> {
  if (typeof namespace === 'undefined') {
    return readReplicant(name, nodecg.bundleName);
  }

  const state = shallowRef();

  nodecg.readReplicant(name, namespace, (value) => {
    state.value = value;
  });

  return readonly(state);
}

async function readReplicantAsync<T>(name: string, namespace?: string): Promise<T> {
  if (typeof namespace === 'undefined') {
    return readReplicantAsync(name, nodecg.bundleName);
  }

  return new Promise((resolve) => {
    nodecg.readReplicant(name, namespace, resolve);
  });
}

export {readReplicant, readReplicantAsync};
