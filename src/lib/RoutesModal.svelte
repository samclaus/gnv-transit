<script lang="ts">
    import { ROUTES, refreshRoutes } from "./cache";

    function submit(ev: SubmitEvent): void {
        ev.preventDefault();


    }
</script>

<h2>Select route(s)</h2>
<button on:click={() => refreshRoutes()}>Refresh routes</button>
<form on:submit>
    {#each $ROUTES as route (route.rt)}
        <label style:border-color={route.rtclr}>
            <input type="checkbox">
            <span class="route-number">
                #{route.rtdd}
            </span>
            {route.rtnm}
        </label>
    {/each}
</form>

<style>
    label {
        margin: 12px 0;

        display: block;

        padding: 8px 12px;

        border: 6px solid transparent;
        border-radius: 8px;

        cursor: pointer;
        user-select: none;
    }

    .route-number {
        margin: 0 4px;
        font-size: 20px;
        font-family: monospace;
        font-weight: bold;
        opacity: .7;
    }
</style>
