/* global nodecg */

import {watchEffect} from 'vue';

export type ListenForHandler<T> = (message: T) => void;

function listenFor<T>(name: string, handler: ListenForHandler<T>): () => void;
function listenFor<T>(name: string, namespace: string, handler: ListenForHandler<T>): () => void;
function listenFor<T>(
  name: string,
  namespace: string | ListenForHandler<T>,
  handler?: ListenForHandler<T>
): () => void {
  if (typeof namespace === 'function') {
    return listenFor(name, nodecg.bundleName, namespace);
  }

  return watchEffect((onInvalidate) => {
    nodecg.listenFor(name, namespace, handler!);

    onInvalidate(() => {
      nodecg.unlisten(name, namespace, handler!);
    });
  });
}

export {listenFor};
