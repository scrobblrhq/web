import type { NowPlayingRich } from "$lib/api/types";

const MAX_ERRORS = 5;

export function useNowPlaying(username: () => string | undefined) {
  let nowPlaying = $state<NowPlayingRich | null>(null);

  $effect(() => {
    const name = username();
    nowPlaying = null;
    if (!name) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let errors = 0;

    const show = (np: NowPlayingRich | null) => {
      clearTimeout(timer);
      nowPlaying = np;
      if (!np) return;
      const ms = new Date(np.expires_at).getTime() - Date.now();
      if (ms <= 0) nowPlaying = null;
      else timer = setTimeout(() => (nowPlaying = null), ms);
    }

    const sse = new EventSource(`/user/${encodeURIComponent(name)}/live`);
    sse.onopen = () => {
      errors = 0;
    }

    sse.onmessage = (e) => {
      try {
        show(JSON.parse(e.data) as NowPlayingRich | null);
      } catch {
        show(null);
      }
    };

    sse.onerror = () => {
      nowPlaying = null;
      if (sse.readyState === EventSource.CLOSED || ++errors > MAX_ERRORS) {
        sse.close();
      }
    };

    return () => {
      clearTimeout(timer);
      sse.close();
    }
  });

  return {
    get current() {
      return nowPlaying;
    },
  };
}
