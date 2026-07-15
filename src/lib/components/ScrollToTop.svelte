<script>
    import { fade } from "svelte/transition";
    import ArrowUp from "@lucide/svelte/icons/arrow-up";

    let showButton = $state(false);

    const handleScroll = () => {
        showButton = window.scrollY > 300;
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
</script>

<svelte:window on:scroll={handleScroll} />

{#if showButton}
    <button
        onclick={scrollToTop}
        class="fixed bottom-8 right-8 z-40 size-12 flex items-center justify-center rounded-full bg-accent text-accent-text shadow-lg"
        transition:fade={{ duration: 200 }}
    >
        <ArrowUp />
    </button>
{/if}
