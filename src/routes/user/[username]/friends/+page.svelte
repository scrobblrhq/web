<script lang="ts">
  import type { PageProps } from "./$types";
  import type { S } from "$lib/api/types";

  import Avatar from "$lib/components/ui/Avatar.svelte";
  import VerifiedBadge from "$lib/components/ui/VerifiedBadge.svelte";

  import UsersIcon from "@lucide/svelte/icons/users";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import { formatCount } from "$lib/utils/format";
  import { addToast } from "$lib/stores/toast.svelte";
  import AuthModal from "$lib/components/auth/AuthModal.svelte";
  import { getLL } from "$lib/i18n.svelte";
  import { setFollow, setBlock, removeFollower, getFollowPage } from "$lib/remote/profile.remote";

  let LL = $derived(getLL());

  const { data }: PageProps = $props();

  const { profile, isOwn, user } = $derived(data);
  let followers = $state<S["FollowEntry"][]>(data.followers);
  let following = $state<S["FollowEntry"][]>(data.following);
  let followersNext = $state<string | null>(data.followersNext);
  let followingNext = $state<string | null>(data.followingNext);

  let activeTab = $state<"followers" | "following">("followers");
  let showAuthModal = $state(false);

  let followState = $state<Record<number, boolean>>({});
  let blockState = $state<Record<string, boolean>>({});
  let removedFollowerIds = $state<number[]>([]);
  let loadingMore = $state(false);

  const visibleFollowers = $derived(followers.filter((entry) => !removedFollowerIds.includes(entry.id)));
  const currentNext = $derived(activeTab === "followers" ? followersNext : followingNext);

  $effect(() => {
    followers = data.followers;
    following = data.following;
    followersNext = data.followersNext;
    followingNext = data.followingNext;
    removedFollowerIds = [];
  });

  $effect(() => {
    blockState = Object.fromEntries(data.blockedUsernames.map((username) => [username, true]));
  });

  $effect(() => {
    if (isOwn) {
      for (const u of following) {
        followState[u.id] = true;
      }
    }
  });

  function isFollowing(target: S["FollowEntry"]): boolean {
    return followState[target.id] ?? target.is_following ?? false;
  }

  async function toggleFollow(target: S["FollowEntry"]) {
    if (!user) {
      showAuthModal = true;
      return;
    }
    const current = followState[target.id] ?? target.is_following ?? false;
    try {
      await setFollow({ username: target.username, follow: !current });
      followState[target.id] = !current;
      addToast(
        current
          ? LL.friends.toast.unfollow({ username: target.username })
          : LL.friends.toast.follow({ username: target.username }),
        "success",
      );
    } catch {
      addToast(LL.friends.toast.error(), "error");
    }
  }

  async function toggleBlock(target: S["FollowEntry"]) {
    if (!user) {
      showAuthModal = true;
      return;
    }
    const current = blockState[target.username] ?? false;
    if (!current && !window.confirm(LL.friends.toast.confirmBlock({ username: target.username }))) return;
    try {
      await setBlock({ username: target.username, block: !current });
      blockState = { ...blockState, [target.username]: !current };
      addToast(
        current
          ? LL.friends.toast.unblock({ username: target.username })
          : LL.friends.toast.block({ username: target.username }),
        "success",
      );
    } catch {
      addToast(LL.friends.toast.actionError(), "error");
    }
  }

  async function handleRemoveFollower(target: S["FollowEntry"]) {
    if (!window.confirm(LL.friends.toast.confirmRemoveFollower({ username: target.username }))) return;
    try {
      await removeFollower({ username: target.username });
      removedFollowerIds = [...removedFollowerIds, target.id];
      addToast(LL.friends.toast.removeFollower({ username: target.username }), "success");
    } catch {
      addToast(LL.friends.toast.actionError(), "error");
    }
  }

  async function loadMore() {
    if (!currentNext || loadingMore) return;
    loadingMore = true;
    const kind = activeTab;
    try {
      const page = await getFollowPage({ username: profile.username, kind, before: currentNext });
      if (kind === "followers") {
        followers = [...followers, ...page.entries];
        followersNext = page.next ?? null;
      } else {
        following = [...following, ...page.entries];
        followingNext = page.next ?? null;
      }
    } catch {
      addToast(LL.friends.toast.actionError(), "error");
    } finally {
      loadingMore = false;
    }
  }

  const currentList = $derived(activeTab === "followers" ? visibleFollowers : following);

  const tabs = $derived([
    // svelte-ignore state_referenced_locally
    { value: "followers", label: LL.friends.tab.followers(), count: visibleFollowers.length },
    // svelte-ignore state_referenced_locally
    { value: "following", label: LL.friends.tab.following(), count: following.length },
  ] as const);
</script>

<svelte:head>
  <meta name="robots" content="noindex, follow" />
  <title>{profile.display_name || profile.username}{LL.friends.meta.titleSuffix()}</title>
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
      name={profile.display_name || profile.username}
      class="w-12 h-12 text-lg"
    />
    <div>
      <h1 class="text-lg font-bold flex items-center gap-1.5">
        {profile.display_name || profile.username}
        {#if profile.is_verified}
          <VerifiedBadge />
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
              name={entry.display_name || entry.username}
              class="w-10 h-10"
            />
          </a>
          <div class="flex-1 min-w-0">
            <a
              href="/user/{entry.username}"
              class="text-sm font-medium truncate block hover:underline"
            >
              <div class="flex items-center gap-1.5">
                {entry.display_name || entry.username}
                {#if entry.is_verified}
                  <VerifiedBadge />
                {/if}
              </div>
            </a>
            <p class="text-xs text-tertiary truncate">
              @{entry.username} · {formatCount(entry.scrobble_count)} {LL.friends.label.scrobbles()}
            </p>
          </div>
          {#if entry.username !== user?.username}
            <div class="flex shrink-0 flex-wrap justify-end gap-2">
            <button
              onclick={() => toggleFollow(entry)}
              class="shrink-0 text-sm px-4 py-1.5 rounded-full border transition-colors {isFollowing(entry)
                ? 'border-border text-tertiary hover:border-red-700 not-dark:hover:bg-red-100 hover:text-red-400'
                : 'border-border text-secondary hover:border-primary hover:text-primary'}"
            >
              {isFollowing(entry) ? LL.friends.button.following() : LL.friends.button.follow()}
            </button>
            <button
              type="button"
              onclick={() => toggleBlock(entry)}
              class="text-sm px-3 py-1.5 rounded-full border border-border text-tertiary transition-colors hover:border-red-700 hover:text-red-400"
            >
              {blockState[entry.username] ? LL.friends.button.unblock() : LL.friends.button.block()}
            </button>
            {#if isOwn && activeTab === "followers"}
              <button
                type="button"
                onclick={() => handleRemoveFollower(entry)}
                class="text-sm px-3 py-1.5 rounded-full border border-border text-tertiary transition-colors hover:border-red-700 hover:text-red-400"
              >
                {LL.friends.button.removeFollower()}
              </button>
            {/if}
            </div>
          {/if}
        </li>
      {/each}
    </ul>
    {#if currentNext}
      <button
        type="button"
        disabled={loadingMore}
        onclick={loadMore}
        class="mt-5 w-full rounded-lg border border-border px-4 py-3 text-sm text-secondary transition-colors hover:bg-hover disabled:opacity-50"
      >
        {loadingMore ? LL.profile.loading() : LL.friends.button.loadMore()}
      </button>
    {/if}
  {/if}
</div>

<AuthModal open={showAuthModal} onclose={() => (showAuthModal = false)} />
