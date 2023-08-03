<script lang="ts">
    import { onDestroy } from "svelte";
    import { getPatternsForRoute, getVehiclesByRoute, type PatternInfo, type StopInfo, type VehicleInfo } from "./api";
    import BusMarker from "./BusMarker.svelte";
    import RouteLine from "./RouteLine.svelte";
    import { refreshStops } from "./state/stops.state";
    import StopMarker from "./StopMarker.svelte";

    /** Pretty self-explanatory. */
    export let routeID: string;
    export let color: string;

    let component_destroyed = false;
    let patterns: PatternInfo[] = [];
    let stops: StopInfo[] = [];
    let vehicles: VehicleInfo[] = [];

    function recursiveRefreshInformation(): void {
        if (component_destroyed) {
            return;
        }

        getVehiclesByRoute([routeID]).then(vehiclesFromServer => {
            if (component_destroyed) {
                return;
            }

            vehicles = vehiclesFromServer;
            setTimeout(recursiveRefreshInformation, 3_000);
        }, console.error);
    }

    // Kick it off
    recursiveRefreshInformation();

    refreshStops(routeID).then(
        stopsFromServer => {
            const addedStops = new Set<string>();

            for (const stop of stopsFromServer) {
                if (!addedStops.has(stop.stpid)) {
                    addedStops.add(stop.stpid);
                    stops.push(stop);
                }
            }

            stops = stops;
        },
    );

    getPatternsForRoute(routeID).then(
        patternsFromServer => {
            patterns = patternsFromServer;
        },
    );

    onDestroy((): void => {
        component_destroyed = true;
    });
</script>

{#each patterns as pattern (pattern.pid)}
    <RouteLine info={pattern} {color} />
{/each}

{#each stops as stop (stop.stpid)}
    <StopMarker
        lat={stop.lat}
        lng={stop.lon}
        name={stop.stpnm} />
{/each}

{#each vehicles as vehicle (vehicle.vid)}
    <BusMarker info={vehicle} {color} />
{/each}