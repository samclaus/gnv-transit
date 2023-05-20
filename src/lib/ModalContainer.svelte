<script lang="ts" context="module">
    import { get, writable } from "svelte/store";
    import { slide } from "svelte/transition";
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
        <div class="modal-scroller">
            <dialog transition:slide open>
                <svelte:component this={$current[0]} />
            </dialog>
        </div>
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
        will-change: opacity;
    }

    .backdrop.visible {
        opacity: .5;
        pointer-events: all;
    }

    .modal-scroller {
        position: absolute;
        inset: 0;
        overflow: auto;
        pointer-events: none;
    }

    dialog {
        margin: 40px auto;

        width: 48rem;
        max-width: 100vw;

        padding: 0 12px;

        background-color: white;
        border: 1px solid rgb(0 0 0 / .12);
        border-radius: 8px;

        will-change: opacity, transform;

        pointer-events: all;
    }
</style>