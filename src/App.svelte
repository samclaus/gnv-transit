<script lang="ts">
    import ModalContainer, { fire } from "./lib/ModalContainer.svelte";
    import { leaflet } from "./lib/leaflet.action";
    import FavoriteStopsModal from "./lib/modals/FavoriteStopsModal.svelte";
    import RoutesModal from "./lib/modals/RoutesModal.svelte";
</script>

<main>
    <h1 class="sr-only">RTS Bus Tracker</h1>
    <div class="map" use:leaflet></div>
    <div class="tools">
        <button
            title="Select routes"
            aria-label="Select routes"
            on:click={() => fire(RoutesModal, {})}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M11,10H5L3,8L5,6H11V3L12,2L13,3V4H19L21,6L19,8H13V10H19L21,12L19,14H13V20A2,2 0 0,1 15,22H9A2,2 0 0,1 11,20V10Z" />
            </svg>
        </button>
        <button
            title="Favorite stops"
            aria-label="Favorite stops"
            on:click={() => fire(FavoriteStopsModal, {})}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 2C8.1 2 5 5.1 5 9C5 14.2 12 22 12 22S19 14.2 19 9C19 5.1 15.9 2 12 2M14.5 13L12 11.5L9.5 13L10.2 10.2L8 8.3L10.9 8.1L12 5.4L13.1 8L16 8.3L13.8 10.2L14.5 13Z" />
            </svg>
        </button>
    </div>
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

    .tools {
        position: absolute;
        bottom: 24px;
        right: 24px;

        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    button {
        padding: 8px;
    }

    button > svg {
        width: 36px;
        height: 36px;
    }
</style>
