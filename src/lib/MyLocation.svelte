<script lang="ts">
    import * as L from "leaflet-lite";
    import { getContext, onDestroy, onMount } from "svelte";
    import { MAP_CTX_KEY } from "./Map.svelte";

    let myLocation: any; // locationfound object from Leaflet Lite

    const map = getContext<() => L.Map>(MAP_CTX_KEY)();
    const circle = new L.Circle(new L.LatLng(0, 0), {
        color: "#1E88E5",
        radius: 0,
    });
    const locator = new L.Locator(map).on("locationfound", ev => {
        myLocation = ev;
    }); // TODO: error handling

    onMount(() => {
        locator.locate({
            setView: true,
            maxZoom: 16,
            watch: true,
            enableHighAccuracy: true,
        });
    });

    onDestroy(() => {
        locator.stopLocate();
        map.removeLayer(circle);
        myLocation = undefined;
    });

    $: if (myLocation) {
        circle.setLatLng(myLocation.latlng);
        circle.setRadius(myLocation.accuracy);

        map.addLayer(circle);
    } else {
        map.removeLayer(circle);
    }
</script>