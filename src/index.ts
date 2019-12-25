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
     */
    $waitForReplicants(): Promise<void>;
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
  Vue.prototype.$waitForReplicants = async function(this: Vue): Promise<void> {
    await Promise.all(this.$children.map(o => o.$waitForReplicants()));
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
