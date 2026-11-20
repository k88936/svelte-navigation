<script lang="ts">
    import type {Snippet} from 'svelte';
    import {useOverlayBackHandler} from '@k88936/svelte-navigation';

    /// A dialog in the browser's top layer: it covers the screen and the tab bar
    /// without replacing either, and the back key closes it instead of navigating.
    let {
        open = $bindable(false),
        label,
        children,
    }: {
        open?: boolean;
        /** Names the dialog for assistive tech. */
        label: string;
        children: Snippet;
    } = $props();

    let dialog = $state<HTMLDialogElement>();

    useOverlayBackHandler(() => open, () => (open = false));

    $effect(() => {
        if (!open || !dialog || dialog.open) return;
        dialog.showModal();
        dialog.focus();
    });
</script>

{#if open}
    <dialog
        bind:this={dialog}
        class="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/45"
        tabindex="-1"
        aria-label={label}
        oncancel={(event) => {
            event.preventDefault();
            open = false;
        }}
        onclick={(event) => {
            if (event.target === event.currentTarget) open = false;
        }}
    >
        {@render children()}
    </dialog>
{/if}
