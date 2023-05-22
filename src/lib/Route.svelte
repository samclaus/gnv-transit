<script lang="ts" context="module">
    import * as L from "leaflet";
    import "leaflet-rotatedmarker";
    import { getContext, onDestroy } from "svelte";
    import { MAP_CTX_KEY } from "./Map.svelte";
    import { getVehiclesByRoute } from "./api";

    const BUS_ICON = L.icon({
        iconUrl: "/bus-icon.svg",
        iconSize: [24, 48],
    });
</script>

<script lang="ts">
    /** Pretty self-explanatory. */
    export let routeID: string;

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

    onDestroy((): void => {
        component_destroyed = true;
        bus_markers.forEach(m => m.remove());
        bus_markers.length = 0;
    });
</script>