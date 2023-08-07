<script lang="ts" context="module">
    import { cubicOut } from "svelte/easing";
    import { get, writable } from "svelte/store";
    import { type TransitionConfig } from "svelte/transition";
    import { Deferred } from "./async-util";

    /**
     * Indicates that the user canceled a modal. This could be by clicking
     * the backdrop, pressing escape, or clicking a button that then
     * programmatically canceled the modal.
     */
    export class ModalCanceledError extends Error {

        constructor() {
            super("modal canceled");
        }

    }

    type Modal = [any, any, Deferred<any>];

    const current = writable<Modal | undefined>(undefined);

    export function show<T>(component: any, params: any): Promise<T> {
        // Cancel the current modal, if any
        cancel();

        // Now show the new modal and return the deferred result promise
        const d = new Deferred<T>();
        current.set([component, params, d]);
        return d.promise;
    }

    export function fire(component: any, params: any): void {
        show(component, params).catch(() => {});
    }

    export function complete(result?: any): void {
        const modal = get(current);

        if (modal) {
            modal[2].resolve(result);
            current.set(undefined);
        }
    }

    export function cancel(): void {
        const modal = get(current);

        if (modal) {
            modal[2].reject(new ModalCanceledError());
            current.set(undefined);
        }
    }

    function slideFade(el: Node, {
        delay = 0,
        duration = 200,
    } = {}): TransitionConfig {
        return {
            delay,
            duration,
            easing: cubicOut,
            css: (t, u) => `
                opacity: ${t};
                transform: translateY(${75 * u}px);
            `,
        };
    }
</script>

<script lang="ts">
    function onBackdropClick(ev: MouseEvent): void {
        ev.stopPropagation();
        cancel();
    }

    function onContainerKeydown(ev: KeyboardEvent): void {
        if (ev.key === "Escape") {
            ev.stopPropagation();
            cancel();
        }
    }
</script>

<div
    class="container"
    on:keydown={onContainerKeydown}>

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="backdrop"
        class:visible={!!$current}
        on:click={onBackdropClick}
    />

    {#if $current}
        <dialog open transition:slideFade>
            <svelte:component this={$current[0]} {...$current[1]} />
        </dialog>
    {/if}

</div>

<style>
    .container {
        position: fixed;
        inset: 0;
        pointer-events: none;
    }

    .backdrop {
        position: absolute;
        inset: 0;

        background-color: black;

        opacity: 0;
        transition: opacity 200ms ease-out;
    }

    .backdrop.visible {
        opacity: .2;
        pointer-events: all;
    }

    dialog {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        margin: 0 auto;
        width: 40rem;
        max-width: 100vw;
        height: calc(50vh - 16px); /* fallback */
        height: calc(50svh - 16px);

        padding: 0 8px;

        display: flex;
        flex-direction: column;
        align-items: stretch;

        background-color: white;
        border: 1px solid rgb(0 0 0 / .12);
        border-radius: 12px 12px 0 0;

        pointer-events: all;
        contain: inline-size layout style paint;
        isolation: isolate;
    }

    :global(.sheet-header) {
        margin: 0;
        padding: 12px 0;
        border-bottom: 1px solid rgba(0, 0, 0, .12);
    }

    :global(.sheet-content) {
        flex: 1 0 0;
        overflow-y: auto;
    }
</style>