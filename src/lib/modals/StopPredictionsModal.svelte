<script lang="ts">
    import { get } from "svelte/store";
    import { getPredictionsForStops, type StopInfo } from "../api";
    import { SELECTED_ROUTES } from "../state/route-selection.state";

    export let stop: StopInfo;

    const selectedRoutes = [...get(SELECTED_ROUTES)];
    const predictions = getPredictionsForStops([stop.stpid], selectedRoutes, "m");
</script>

<h2>
    {stop.stpnm} (<code>{stop.stpid}</code>)
</h2>

{#await predictions}
    <p>Loading predictions...</p>
{:then predictions} 
    {#if predictions.length > 0}
        <ul>
            {#each predictions as pred}
                <li>
                    <div><strong>{pred.typ === "D" ? "Departure" : "Arrival"}</strong></div>
                    <div>{pred.prdctdn} minute(s)</div>
                    <div style:color={pred.dly ? 'red' : 'green'}>
                        {pred.dly ? 'DELAYED' : 'ON TIME'}
                    </div>
                    <div><em>Prediction generated at {pred.tmstmp}</em></div>
                </li>
            {/each}
        </ul>
    {:else}
        <p>No predictions available at this time for your selected routes.</p>
    {/if}
{:catch err}
    <p>Failed to load predictions!</p>
{/await}

<style>
    li {
        margin: 2em 0;
    }
</style>