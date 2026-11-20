<script lang="ts">
    import {useNavigation} from '@k88936/svelte-navigation';
    import type {HomeStackParamList} from '../params';
    import Overlay from '../Overlay.svelte';

    const navigation = useNavigation<HomeStackParamList>();

    let count = $state(0);
    let text = $state('');
    let dialog = $state(false);

    const rows = Array.from({length: 60}, (_, index) => index + 1);
</script>

<div class="space-y-3 p-4">
    <p class="text-sm text-muted">This counter and the text must survive a push and a back.</p>
    <p id="count" class="text-2xl font-semibold">{count}</p>
    <input class="w-full rounded-lg bg-gray px-4 py-2.5 text-sm outline-none" placeholder="type something" bind:value={text} />
    <button
        type="button"
        class="rounded-lg bg-primary px-4 py-2 text-sm text-on-primary"
        onclick={() => count++}
    >
        increment
    </button>
    <button
        type="button"
        class="rounded-lg bg-gray px-4 py-2 text-sm"
        onclick={() => navigation.navigate('Detail', {id: '42'})}
    >
        open detail
    </button>
    <button
        type="button"
        class="rounded-lg bg-gray px-4 py-2 text-sm"
        onclick={() => navigation.navigate('Sheet')}
    >
        open sheet
    </button>
    <button
        type="button"
        class="rounded-lg bg-gray px-4 py-2 text-sm"
        onclick={() => (dialog = true)}
    >
        open dialog
    </button>
    {#each rows as row (row)}
        <p class="border-b border-line py-3 text-sm">row {row}</p>
    {/each}
</div>

<Overlay bind:open={dialog} label="Playground dialog">
    <div class="flex h-full items-center justify-center p-4">
        <div class="w-full space-y-3 rounded-xl bg-light p-4">
            <p class="text-sm text-muted">A dialog over the screen: the back key closes it, it does not leave Home.</p>
            <p id="dialog-count" class="text-2xl font-semibold">count {count}</p>
            <button
                type="button"
                class="rounded-lg bg-primary px-4 py-2 text-sm text-on-primary"
                onclick={() => (dialog = false)}
            >
                close dialog
            </button>
        </div>
    </div>
</Overlay>
