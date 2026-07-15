<script lang="ts">
  import type { PageProps } from "./$types";
  import type { UserProfile } from "$lib/api/types";

  import Avatar from "$lib/components/Avatar.svelte";
  import VerifiedIcon from "@lucide/svelte/icons/check";
  import UsersIcon from "@lucide/svelte/icons/users";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import { formatCount } from "$lib/utils/format";
  import { addToast } from "$lib/stores/toast.svelte";
  import AuthModal from "$lib/components/ui/AuthModal.svelte";
  import { api } from "$lib/api";
  import { getLL } from "$lib/i18n.svelte";

  let LL = $derived(getLL());

  const { data }: PageProps = $props();

  const { profile, followers, following, isOwn, user } = $derived(data);

  let activeTab = $state<"followers" | "following">("followers");
  let showAuthModal = $state(false);

  let followState = $state<Record<number, boolean>>({});

  $effect(() => {
    if (isOwn) {
      for (const u of following) {
        followState[u.id] = true;
      }
    }
  });

  function isFollowing(target: UserProfile): boolean {
    return followState[target.id] ?? false;
  }

  async function toggleFollow(target: UserProfile) {
    if (!user) {
      showAuthModal = true;
      return;
    }
    const current = followState[target.id] ?? false;
    try {
      if (current) {
        await api.profile.unfollow(target.username, user.token);
        followState[target.id] = false;
        addToast(LL.friends.toast.unfollow({ username: target.username }), "success");
      } else {
        await api.profile.follow(target.username, user.token);
        followState[target.id] = true;
        addToast(LL.friends.toast.follow({ username: target.username }), "success");
      }
    } catch {
      addToast(LL.friends.toast.error(), "error");
    }
  }

  const currentList = $derived(
    activeTab === "followers" ? followers : following,
  );

  const tabs = [
    // svelte-ignore state_referenced_locally
    { value: "followers", label: LL.friends.tab.followers(), count: followers.length },
    // svelte-ignore state_referenced_locally
    { value: "following", label: LL.friends.tab.following(), count: following.length },
  ] as const;
</script>

<svelte:head>
  <title>{profile.display_name ?? profile.username}{LL.friends.meta.titleSuffix()}</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-8">
  <a
    href="/user/{profile.username}"
    class="inline-flex items-center gap-1.5 text-sm text-tertiary hover:text-secondary transition-colors mb-6"
  >
    <ArrowLeft size={16} />
    @{profile.username}
  </a>

  <div class="flex items-center gap-3 mb-6">
    <Avatar
      url={profile.image_url}
      name={profile.display_name ?? profile.username}
      class="w-12 h-12 text-lg"
    />
    <div>
      <h1 class="text-lg font-bold flex items-center gap-1.5">
        {profile.display_name ?? profile.username}
        {#if profile.is_verified}
          <VerifiedIcon size={16} class="text-blue-400" />
        {/if}
      </h1>
      <p class="text-sm text-tertiary">{LL.friends.pageTitle()}</p>
    </div>
  </div>

  <div class="flex bg-card rounded-lg p-1 mb-6">
    {#each tabs as tab}
      <button
        class="flex-1 py-2 text-sm font-medium rounded-md transition-colors {activeTab ===
        tab.value
          ? 'bg-active text-primary'
          : 'text-tertiary hover:text-secondary'}"
        onclick={() => (activeTab = tab.value)}
      >
        {tab.label} ({tab.count})
      </button>
    {/each}
  </div>

  {#if currentList.length === 0}
    <div class="flex flex-col items-center justify-center py-16 text-tertiary">
      <UsersIcon size={48} class="mb-4 opacity-50" />
      <p class="text-sm">
        {activeTab === "followers"
          ? LL.friends.empty.followers()
          : LL.friends.empty.following()}
      </p>
    </div>
  {:else}
    <ul class="space-y-1">
      {#each currentList as entry (entry.id)}
        <li
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-hover transition-colors"
        >
          <a href="/user/{entry.username}" class="shrink-0">
            <Avatar
              url={entry.image_url}
              name={entry.display_name ?? entry.username}
              class="w-10 h-10"
            />
          </a>
          <div class="flex-1 min-w-0">
            <a
              href="/user/{entry.username}"
              class="text-sm font-medium truncate block hover:underline"
            >
              {entry.display_name ?? entry.username}
              {#if entry.is_verified}
                <VerifiedIcon size={14} class="inline text-blue-400" />
              {/if}
            </a>
            <p class="text-xs text-tertiary truncate">
              @{entry.username} · {formatCount(entry.scrobble_count)} {LL.friends.label.scrobbles()}
            </p>
          </div>
          {#if entry.username !== user?.username}
            <button
              onclick={() => toggleFollow(entry)}
              class="shrink-0 text-sm px-4 py-1.5 rounded-full border transition-colors {isFollowing(entry)
                ? 'border-border text-tertiary hover:border-red-700 not-dark:hover:bg-red-100 hover:text-red-400'
                : 'border-border text-secondary hover:border-primary hover:text-primary'}"
            >
              {isFollowing(entry) ? LL.friends.button.following() : LL.friends.button.follow()}
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<AuthModal open={showAuthModal} onclose={() => (showAuthModal = false)} />
