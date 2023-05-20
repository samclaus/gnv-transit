<script lang="ts" context="module">
    import { get, writable } from "svelte/store";
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

    function onBackdropKeydown(ev: KeyboardEvent): void {
        if (ev.key === "Escape") {
            ev.stopPropagation();
            cancel();
        }
    }
</script>

<div
    class="modal-container"
    class:visible={!!$current}
    on:click={onBackdropClick}
    on:keydown={onBackdropKeydown}>

    {#if $current}
        <dialog>
            <svelte:component this={$current[0]} />
        </dialog>
    {/if}

</div>

<style>
    .modal-container {
        position: fixed;
        inset: 0;

        background-color: black;
        opacity: 0;

        transition: opacity 68ms ease-out;
        will-change: opacity;
    }

    .modal-container.visible {
        opacity: .3;
    }

    dialog {
        padding: 0 12px;

        background-color: white;
        border: 1px solid rgb(0 0 0 / .12);
        border-radius: 8px;
    }
</style>