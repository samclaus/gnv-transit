<script lang="ts">
    import { onDestroy } from "svelte";
    import { get } from "svelte/store";
    import { getPredictionsForStops, PassengerLoad, type PredictionInfo, type StopInfo } from "../api";
    import { SELECTED_ROUTES } from "../state/route-selection.state";
    import { ROUTES, ROUTES_BY_ID } from "../state/routes.state";

    export let stop: StopInfo;

    const REFRESH_INTERVAL_SEC = 30;
    const selectedRoutes = [...get(SELECTED_ROUTES)];

    let predictions: PredictionInfo[] = [];
    let lastRefreshed = 0; // NEVER / beginning of time!
    let refreshCountdown = 0;
    let refreshing = false;
    let refreshErr: unknown;

    function isNumberish(n: any): boolean {
        return !Number.isNaN(parseFloat(n));
    }

    function refreshPredictions(): void {
        refreshing = true;
        getPredictionsForStops([stop.stpid], selectedRoutes, "m").then(
            preds => {
                predictions = preds;
                refreshErr = undefined;
            },
            err => {
                // Still let them see the previous predictions, if any!
                refreshErr = err;
            },
        ).finally(
            () => {
                lastRefreshed = Date.now();
                refreshCountdown = REFRESH_INTERVAL_SEC;
                refreshing = false;
            },
        );
    }

    const refreshCountdownInterval = setInterval(() => {
        const elapsed = Date.now() - lastRefreshed;
        refreshCountdown = REFRESH_INTERVAL_SEC - Math.floor(elapsed / 1000);

        if (refreshCountdown <= 0 && !refreshing) {
            console.log("Refreshing predictions!");
            refreshPredictions();
        }
    }, 500);

    refreshPredictions();

    $: routesByID = $ROUTES && ROUTES_BY_ID;

    onDestroy(() => clearInterval(refreshCountdownInterval));
</script>

<h2 class="sheet-header">
    {stop.stpnm}
    <span class="stop-number">#{stop.stpid}</span>
</h2>

<div class="sheet-content">
    <p>
        {#if refreshCountdown <= 0}
            Refreshing predictions...
        {:else}
            Refreshing predictions in {refreshCountdown}s...
        {/if}
    </p>
    {#if refreshErr}
        <p class="fg-error">
            Sorry, an error occurred when refreshing the predictions for this stop. This could be
            because your device is on airplane mode, the RTS servers are having issues, or maybe
            there are too many people using my application and RTS has temporarily disabled my API
            access, etc. In a future update, I will show you detailed information about the error
            so that you can screenshot and email it to me! (Or, of course, give an explanation of
            why the error is not something I can fix.)
        </p>
    {/if}
    <!-- TODO: show refresh error -->
    {#if predictions.length > 0}
        <ul>
            {#each predictions as pred}
                {@const route = routesByID.get(pred.rt)}
                <li style:border-color={route?.rtclr || "#333"}>
                    <div class="pred-routedd">
                        {route?.rtdd || pred.rt}
                    </div>
                    <div class="pred-main">
                        <div>
                            {#if route}
                                {route.rtnm}
                            {:else}
                                <em>Unknown route</em>
                            {/if}
                        </div>
                        <div>
                            <strong>➔ {pred.des}</strong>
                            {#if pred.dly}
                                <span class="badge error">
                                    Delayed
                                </span>
                            {/if}
                            {#if pred.psgld === PassengerLoad.HalfEmpty}
                                <span class="badge warn">
                                    Bus Half-Full
                                </span>
                            {:else if pred.psgld === PassengerLoad.Full}
                                <span class="badge error">
                                    Bus Full
                                </span>
                            {/if}
                        </div>
                    </div>
                    <div class="pred-countdown">
                        {isNumberish(pred.prdctdn) ? (pred.prdctdn + "m") : pred.prdctdn}
                    </div>
                </li>
            {/each}
        </ul>
    {:else if !refreshing}
        <p>No predictions available at this time for your selected routes.</p>
    {/if}
</div>

<style>
    .stop-number {
        opacity: 0.4;
    }

    ul {
        padding: 0;

        list-style-type: none;
    }

    li {
        margin: 1em 0;

        padding: 4px 8px;

        display: flex;
        align-items: center;

        border-color: transparent;
        border-style: solid;
        border-width: 1px 1px 1px 4px;
        border-radius: 8px;
    }

    .pred-routedd {
        min-width: 2.5ch;

        font-size: 24px;
    }

    .pred-main {
        margin: 0 4px;

        flex: 1 0 0;
    }

    .pred-countdown {
        min-width: 3.5ch;

        font-size: 24px;
        font-weight: bold;

        opacity: 0.6;
    }
</style>