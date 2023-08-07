<script lang="ts">
    import * as L from "leaflet-lite";
    import { getContext, onDestroy } from "svelte";
    import { MAP_CTX_KEY } from "./Map.svelte";

    export let animateSetView = false;

    let enabledAt = Date.now();

    const map = getContext<() => L.Map>(MAP_CTX_KEY)();
    const circle = new L.Circle(new L.LatLng(0, 0), {
        color: "#1E88E5",
        radius: 0,
    });
    const locationWatchHandle = navigator.geolocation.watchPosition(
        pos => {
            const { longitude, latitude, accuracy } = pos.coords;
            const latlng = new L.LatLng(latitude, longitude);

            circle.setLatLng(latlng);
            circle.setRadius(accuracy);
            map.addLayer(circle);
            
            // Only set the view if our position is obtained within 2s
            // of the user enabling geolocation
            if (Date.now() - enabledAt < 2_000) {
                console.log("Setting view:", animateSetView);
                map.setView(latlng, 16, { animate: animateSetView });
                enabledAt = 0; // prevent further setView() calls
            }
        },
        undefined, // TODO: error handling
        { enableHighAccuracy: true },
    );

    onDestroy(() => {
        navigator.geolocation.clearWatch(locationWatchHandle);
        map.removeLayer(circle);
    });
</script>