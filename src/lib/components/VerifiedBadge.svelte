<script lang="ts">
  import { getLL } from "$lib/i18n.svelte";
  import VerifiedIcon from "@lucide/svelte/icons/check";
  import Tooltip from "./Tooltip.svelte";

  let LL = $derived(getLL());

  let { size = 16, ...props } = $props();
</script>

<span {...props} class="bg-blue-100 dark:bg-slate-700 rounded-md p-[2px]">
  <Tooltip text={LL.profile.verifiedTooltip()}>
    <VerifiedIcon class="text-blue-300" {size} />
  </Tooltip>
</span>
