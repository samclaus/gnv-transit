<script lang="ts">
    import ModalContainer, { fire } from "./lib/ModalContainer.svelte";
    import RoutesModal from "./lib/RoutesModal.svelte";
    import { leaflet } from "./lib/leaflet.action";
</script>

<main>
    <h1>RTS Bus Tracker</h1>
    <div class="map" use:leaflet></div>
    <button on:click={() => fire(RoutesModal, {})}>Select routes</button>
</main>

<ModalContainer />

<style>
    main {
        padding: 0 16px;

        isolation: isolate;
    }

    .map {
        height: 400px;
        border-radius: 8px;
    }
</style>
