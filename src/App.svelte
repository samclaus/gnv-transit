<script lang="ts">
    import BottomSheet, { fire } from "./lib/BottomSheet.svelte";
    import Map from "./lib/Map.svelte";
    import ModalContainer from "./lib/ModalContainer.svelte";
    import MyLocation from "./lib/MyLocation.svelte";
    import Route from "./lib/Route.svelte";
    import SelectedStop from "./lib/SelectedStop.svelte";
    import RoutesModal from "./lib/modals/RoutesModal.svelte";
    import { SELECTED_ROUTES } from "./lib/state/route-selection.state";
    import { ROUTES } from "./lib/state/routes.state";

    const GPS_STORAGE_KEY = "gps_enabled";

    let gpsEnabled = !!localStorage.getItem(GPS_STORAGE_KEY);
    let userToggledGPS = false;

    $: selectedRoutes = $ROUTES.filter(rt => $SELECTED_ROUTES.has(rt.rt));
    $: if (gpsEnabled) {
        localStorage.setItem(GPS_STORAGE_KEY, "true");
    } else {
        localStorage.removeItem(GPS_STORAGE_KEY);
    }

    function toggleGPS(): void {
        userToggledGPS = true;
        gpsEnabled = !gpsEnabled;
    }
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
        {#each selectedRoutes as rt (rt.rt)}
            <Route routeID={rt.rt} color={rt.rtclr} />
        {/each}

        {#if gpsEnabled}
            <MyLocation animateSetView={userToggledGPS} />
        {/if}

        <SelectedStop />
    </Map>

    <!-- Floating buttons down in the bottom-right corner -->
    <div class="tools">
        <button
            title="Toggle my location"
            aria-label="Toggle my location"
            aria-pressed={gpsEnabled}
            class:active={gpsEnabled}
            on:click={toggleGPS}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z" />
            </svg>
        </button>
        <div class="divider" />
        <!-- <button
            title="Favorite stops"
            aria-label="Favorite stops"
            on:click={() => fire(FavoriteStopsModal, {})}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 2C8.1 2 5 5.1 5 9C5 14.2 12 22 12 22S19 14.2 19 9C19 5.1 15.9 2 12 2M14.5 13L12 11.5L9.5 13L10.2 10.2L8 8.3L10.9 8.1L12 5.4L13.1 8L16 8.3L13.8 10.2L14.5 13Z" />
            </svg>
        </button>
        <div class="divider" /> -->
        <button
            title="Select routes"
            aria-label="Select routes"
            on:click={() => fire(RoutesModal, {})}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M11,10H5L3,8L5,6H11V3L12,2L13,3V4H19L21,6L19,8H13V10H19L21,12L19,14H13V20A2,2 0 0,1 15,22H9A2,2 0 0,1 11,20V10Z" />
            </svg>
        </button>
    </div>

</main>

<BottomSheet />
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

        opacity: 0.8;
    }

    button {
        padding: 12px;

        border: 1px solid #111;
        border-top-width: 0;
        border-bottom-width: 0;

        background-color: #333;
        color: #ccc;
        cursor: pointer;
    }

    button.active {
        color: #1E88E5;
    }

    button:first-child {
        border-top-width: 1px;
        border-radius: 8px 8px 0 0;
    }

    button:last-child {
        border-bottom-width: 1px;
        border-radius: 0 0 8px 8px;
    }

    button > svg {
        fill: currentColor;
        width: 36px;
        height: 36px;
    }

    .divider {
        height: 1px;
        background-color: #999;
    }
</style>
