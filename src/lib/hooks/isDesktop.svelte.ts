const DEFAULT_BREAKPOINT = 1024;

export function useIsDesktop(breakpoint: number = DEFAULT_BREAKPOINT) {
  let isDesktop = $state(false);

  $effect(() => {
    const query = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const update = () => (isDesktop = query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  });

  return {
    get current() {
      return isDesktop;
    },
  };
}
