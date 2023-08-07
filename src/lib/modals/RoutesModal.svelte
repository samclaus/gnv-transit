<script lang="ts">
    import { complete } from "../ModalContainer.svelte";
    import { SELECTED_ROUTES, selectOnlyRoute, toggleRouteSelected } from "../state/route-selection.state";
    import { ROUTES } from "../state/routes.state";
</script>

<h2 class="sheet-header">
    Select route(s)
</h2>
<div class="sheet-content">
    <p>
        <strong>NOTE:</strong> Double-click a route to de-select all others.
    </p>
    <form on:submit|preventDefault={complete}>
        {#each $ROUTES as route (route.rt)}
            <label style:border-color={route.rtclr} on:dblclick={() => selectOnlyRoute(route.rt)}>
                <input
                    type="checkbox"
                    checked={$SELECTED_ROUTES.has(route.rt)}
                    on:input={() => toggleRouteSelected(route.rt)}>
                <span class="route-number">
                    #{route.rtdd}
                </span>
                {route.rtnm}
            </label>
        {/each}
    </form>
</div>

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
