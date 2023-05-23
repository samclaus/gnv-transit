<script lang="ts" context="module">
    import * as L from "leaflet";
    import "leaflet-rotatedmarker";
    import { getContext, onDestroy } from "svelte";
    import { MAP_CTX_KEY } from "./Map.svelte";
    import { getDirectionsForRoute, getPatternsForRoute, getStopsForRoute, getVehiclesByRoute, type PatternInfo, type StopInfo } from "./api";

    const BUS_ICON = L.icon({
        iconUrl: "/bus-icon.svg",
        iconSize: [24, 48],
    });
</script>

<script lang="ts">
    import RouteLine from "./RouteLine.svelte";
import StopMarker from "./StopMarker.svelte";

    /** Pretty self-explanatory. */
    export let routeID: string;
    export let color: string;

    const map = getContext<() => L.Map>(MAP_CTX_KEY)();

    let component_destroyed = false;
    let bus_markers: L.Marker[] = [];

    function recursiveRefreshInformation(): void {
        if (component_destroyed) {
            return;
        }

        getVehiclesByRoute([routeID]).then(vehicles => {
            if (component_destroyed) {
                return;
            }

            bus_markers.forEach(m => m.remove());
            bus_markers.length = 0;

            for (const v of vehicles) {
                bus_markers.push(
                    L.marker([v.lat, v.lon], {
                        icon: BUS_ICON,
                        rotationAngle: v.hdg,
                        rotationOrigin: "center",
                    }).addTo(map),
                );
            }

            setTimeout(recursiveRefreshInformation, 3_000);
        }, console.error);
    }

    // Kick it off
    recursiveRefreshInformation();

    function flatten<T>(arr: T[][]): T[] {
        const result: T[] = [];

        for (const subArr of arr) {
            result.push(...subArr);
        }

        return result;
    }

    let stops: StopInfo[] = [];

    getDirectionsForRoute(routeID).then(
        directions => Promise.all(
            directions.map(d => getStopsForRoute(routeID, d.id))
        ).then(flatten),
    ).then(
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

    let patterns: PatternInfo[] = [];

    getPatternsForRoute(routeID).then(
        patternsFromServer => {
            patterns = patternsFromServer;
        },
    );

    onDestroy((): void => {
        component_destroyed = true;
        bus_markers.forEach(m => m.remove());
        bus_markers.length = 0;
    });
</script>

{#each patterns as pattern (pattern.pid)}
    <RouteLine info={pattern} {color} />
{/each}

{#each stops as stop (stop.stpid)}
    <StopMarker
        lat={stop.lat}
        lng={stop.lon}
        name={stop.stpnm}
        {color} />
{/each}