<script lang="ts">
    import Map from "./lib/Map.svelte";
    import ModalContainer, { fire } from "./lib/ModalContainer.svelte";
    import Route from "./lib/Route.svelte";
    import FavoriteStopsModal from "./lib/modals/FavoriteStopsModal.svelte";
    import RoutesModal from "./lib/modals/RoutesModal.svelte";
    import { SELECTED_ROUTES } from "./lib/state/route-selection.state";
</script>

<main>
    
    <!-- The application name, for screen readers (used by visually impaired people) only -->
    <h1 class="sr-only">RTS Bus Tracker</h1>

    <!--
        <Map> creates a Leaflet map instance imperatively and passes it down to child
        components via the Svelte context API.

        Each <Route> component, when mounted by Svelte, will grab the map instance from
        context and start adding its own set of stop markers, a polyline for the route
        itself, etc., and will update the elements as necessary whenever it refreshes
        information from the server.

        This should be quite performant because Svelte will only re-mount each <Route>
        when truly necessary, i.e., the route was not selected and now is selected.
    -->
    <Map class="central-map">
        {#each Array.from($SELECTED_ROUTES) as routeID (routeID)}
            <Route routeID={routeID} />
        {/each}
    </Map>

    <!-- Floating buttons down in the bottom-right corner -->
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

    main > :global(.central-map) {
        position: absolute;
        inset: 0;
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
