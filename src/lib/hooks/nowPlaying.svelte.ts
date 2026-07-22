import type { NowPlayingRich } from "$lib/api/types";

export function useNowPlaying(username: () => string | undefined) {
  let nowPlaying = $state<NowPlayingRich | null>(null);

  $effect(() => {
    const name = username();
    nowPlaying = null;
    if (!name) return;

    const sse = new EventSource(`/user/${name}/live`);
    sse.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        nowPlaying = parsed === null ? null : parsed;
      } catch {
        nowPlaying = null;
      }
    };
    return () => sse.close();
  });

  return {
    get current() {
      return nowPlaying;
    },
  };
}
