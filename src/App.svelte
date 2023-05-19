<script lang="ts">
    import { ROUTES, refreshRoutes } from "./lib/cache";
    import { leaflet } from "./lib/leaflet.action";
</script>

<main>
    <h1>RTS Bus Tracker</h1>
    <div class="map" use:leaflet></div>
    <button on:click={() => refreshRoutes()}>Refresh routes</button>
    <h2>{$ROUTES.length} Routes</h2>
    <div class="container">
        {#each $ROUTES as route (route.rt)}
            <div class="card">
                <h3>
                    {route.rtnm} (<code>{route.rtdd}</code>)
                </h3>
                <div style="min-height: 20px; background-color: {route.rtclr}">

                </div>
            </div>
        {/each}
    </div>
</main>

<style>
    main {
        padding: 0 16px;
    }

    .map {
        height: 400px;
        border-radius: 8px;
    }

    .container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    .container > * {
        flex: 1 0 0;
        min-width: 200px;
    }

    .card {
        display: block;

        padding: 8px;

        background-color: #777;
        border: 1px solid rgb(255 255 255 / .12);
        border-radius: 8px;
    }
</style>
