<script lang="ts">
    import ModalContainer, { fire } from "./lib/ModalContainer.svelte";
    import { leaflet } from "./lib/leaflet.action";
    import RoutesModal from "./lib/modals/RoutesModal.svelte";
</script>

<main>
    <h1 class="sr-only">RTS Bus Tracker</h1>
    <div class="map" use:leaflet></div>
    <button
        title="Select routes"
        aria-label="Select routes"
        on:click={() => fire(RoutesModal, {})}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M11,10H5L3,8L5,6H11V3L12,2L13,3V4H19L21,6L19,8H13V10H19L21,12L19,14H13V20A2,2 0 0,1 15,22H9A2,2 0 0,1 11,20V10Z" />
        </svg>
    </button>
</main>

<ModalContainer />

<style>
    main {
        position: fixed;
        inset: 0;
    }

    .map {
        position: absolute;
        inset: 0;
        isolation: isolate;
    }

    button {
        position: absolute;
        bottom: 24px;
        right: 24px;

        padding: 8px;
    }

    button > svg {
        width: 36px;
        height: 36px;
    }
</style>
