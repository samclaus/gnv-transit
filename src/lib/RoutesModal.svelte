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
            {route.rtnm} (<code>{route.rtdd}</code>)
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
</style>
