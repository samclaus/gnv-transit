<script lang="ts">
    import BottomSheet, { fire } from "./lib/BottomSheet.svelte";
    import Map from "./lib/Map.svelte";
    import ModalContainer from "./lib/ModalContainer.svelte";
    import MyLocation from "./lib/MyLocation.svelte";
    import Route from "./lib/Route.svelte";
    import SelectedStop from "./lib/SelectedStop.svelte";
    import RoutesModal from "./lib/modals/RoutesModal.svelte";
    import AboutSheet from "./lib/sheets/AboutSheet.svelte";
    import { SELECTED_ROUTES } from "./lib/state/route-selection.state";
    import { ROUTES } from "./lib/state/routes.state";

    const GPS_STORAGE_KEY = "gps_enabled";

    let gpsEnabled = !!localStorage.getItem(GPS_STORAGE_KEY);
    let userToggledGPS = false;

    $: selectedRoutes = $ROUTES.filter(rt => $SELECTED_ROUTES.has(rt.rt));

    function toggleGPS(): void {
        userToggledGPS = true;
        gpsEnabled = !gpsEnabled;

        if (gpsEnabled) {
            localStorage.setItem(GPS_STORAGE_KEY, "true");
        } else {
            localStorage.removeItem(GPS_STORAGE_KEY);
        }
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

    <!-- Floating buttons up in the top-right corner -->
    <div class="tools top">
        <button
            title="About this app"
            aria-label="About this app"
            on:click={() => fire(AboutSheet, {}, true)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
            </svg>
        </button>
    </div>

    <!-- Floating buttons down in the bottom-right corner -->
    <div class="tools bottom">
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
        right: 24px; /* top/bottom set by another class */

        display: flex;
        flex-direction: column;

        border: 1px solid #111;
        border-radius: 8px;

        opacity: 0.8;
        overflow: hidden;
    }

    .tools.top {
        top: 24px;
    }

    .tools.bottom {
        bottom: 24px;
    }

    button {
        padding: 12px;

        border: none;

        background-color: #333;
        color: #ccc;
        cursor: pointer;
    }

    button.active {
        color: #1E88E5;
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
