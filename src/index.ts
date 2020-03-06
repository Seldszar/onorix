import { NodeCGBrowser, ReplicantBrowser, ReplicantOptions } from "nodecg/types/browser";
import Vue, { VueConstructor } from "vue";

import { wrapNodeCG } from "./helpers";

export interface ReplicantDescriptor<V> extends ReplicantOptions<V> {
  namespace?: string;
  name?: string;
}

declare module "vue/types/vue" {
  interface VueConstructor {
    /**
     * The NodeCG instance.
     */
    nodecg: NodeCGBrowser;
  }

  interface Vue {
    /**
     * The NodeCG instance.
     */
    $nodecg: NodeCGBrowser;

    /**
     * The declared replicants.
     */
    $replicants: {
      [key: string]: ReplicantBrowser<unknown>;
    };

    /**
     * Awaits until declared replicants are ready.
     * @param deep indicates if children must be included
     */
    $waitForReplicants(deep?: boolean): Promise<void>;
  }
}

declare module "vue/types/options" {
  interface ComponentOptions<V extends Vue> {
    /**
     * The replicants.
     */
    replicants?: {
      [key: string]: ReplicantDescriptor<unknown>;
    };
  }
}

export * from "./decorators";
export * from "./helpers";

/**
 * Installs the plugin.
 * @param Vue the Vue constructor
 */
export default function install(Vue: VueConstructor<Vue>): void {
  Vue.prototype.$nodecg = Vue.nodecg = wrapNodeCG(Vue, nodecg);
  Vue.prototype.$waitForReplicants = async function(this: Vue, deep = true): Promise<void> {
    if (deep) {
      await Promise.all(this.$children.map(o => o.$waitForReplicants(deep)));
    }

    await NodeCG.waitForReplicants(...Object.values(this.$replicants));
  };

  Vue.mixin({
    beforeCreate() {
      this.$replicants = {};

      if (this.$options.replicants == null) {
        return;
      }

      for (const [key, descriptor] of Object.entries(this.$options.replicants)) {
        this.$replicants[key] = this.$nodecg.Replicant(
          descriptor.name || key,
          descriptor.namespace,
          descriptor,
        );
      }
    },
  });
}
