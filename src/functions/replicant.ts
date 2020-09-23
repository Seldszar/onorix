/* eslint-disable new-cap */
/* global nodecg, NodeCG */

import {ReplicantOptions} from 'nodecg/types/browser';
import {customRef, watchEffect, Ref} from 'vue';

function replicant<T>(name: string, options?: ReplicantOptions<T>): Ref<T | undefined>;
function replicant<T>(
  name: string,
  namespace: string,
  options?: ReplicantOptions<T>
): Ref<T | undefined>;
function replicant<T>(
  name: string,
  namespace?: string | ReplicantOptions<T>,
  options?: ReplicantOptions<T>
): Ref<T | undefined> {
  const rep =
    typeof namespace === 'string'
      ? nodecg.Replicant(name, namespace, options)
      : nodecg.Replicant(name, namespace);

  return customRef((track, trigger) => {
    watchEffect(() => {
      rep.addListener('change', trigger);

      return () => {
        rep.removeListener('change', trigger);
      };
    });

    return {
      get() {
        track();

        if (rep.status === 'declared') {
          return rep.value;
        }

        return rep.opts.defaultValue;
      },
      set(value) {
        if (rep.value === value) {
          return;
        }

        rep.value = value;
      }
    };
  });
}

async function replicantAsync<T>(
  name: string,
  options?: ReplicantOptions<T>
): Promise<Ref<T | undefined>>;
async function replicantAsync<T>(
  name: string,
  namespace: string,
  options?: ReplicantOptions<T>
): Promise<Ref<T | undefined>>;
async function replicantAsync<T>(
  name: string,
  namespace?: string | ReplicantOptions<T>,
  options?: ReplicantOptions<T>
): Promise<Ref<T | undefined>> {
  const rep =
    typeof namespace === 'string'
      ? nodecg.Replicant(name, namespace, options)
      : nodecg.Replicant(name, namespace);

  await NodeCG.waitForReplicants(rep);

  return customRef((track, trigger) => {
    watchEffect(() => {
      rep.addListener('change', trigger);

      return () => {
        rep.removeListener('change', trigger);
      };
    });

    return {
      get() {
        track();

        if (rep.status === 'declared') {
          return rep.value;
        }

        return rep.opts.defaultValue;
      },
      set(value) {
        if (rep.value === value) {
          return;
        }

        rep.value = value;
      }
    };
  });
}

export {replicant, replicantAsync};
