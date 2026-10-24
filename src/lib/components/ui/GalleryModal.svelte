<script lang="ts">
    import { tick } from "svelte";
    import Modal from "#lib/components/feedback/Modal.svelte";
    import Carousel from "#lib/components/ui/Carousel.svelte";

    type Item = { image: string; alt?: string };

    interface Props {
        open: boolean;
        items: Item[];
        label: string;
        onclose: () => void;
        returnFocusTo?: HTMLElement | null;
    }

    let { open, items, label, onclose, returnFocusTo = null }: Props = $props();

    let bodyEl: HTMLDivElement | undefined = $state();

    function close() {
        if (!open) return;
        onclose();
        tick().then(() => returnFocusTo?.focus());
    }

    $effect(() => {
        if (open && bodyEl) {
            bodyEl
                .querySelector<HTMLElement>('[aria-roledescription="carousel"]')
                ?.focus({ preventScroll: true });
        }
    });
</script>

<Modal {open} onclose={close} panelClass="max-w-3xl p-3 sm:p-6" {label}>
    <div bind:this={bodyEl} class="mt-6 w-full h-[min(60vh,26rem)] sm:h-[min(70vh,34rem)]">
        <Carousel
            {items}
            cardWidth={280}
            cardHeight={380}
            depth={220}
            spread={70}
            tilt={22}
            visibleCards={4}
            wheel
        />
    </div>
</Modal>
