<script lang="ts">
    import * as L from "leaflet-lite";
    import { getContext, onDestroy } from "svelte";
    import { MAP_CTX_KEY } from "./Map.svelte";

    export let lat: number;
    export let lng: number;
    export let name: string;

    const map = getContext<() => L.Map>(MAP_CTX_KEY)();
    const circle = new L.Circle(new L.LatLng(lat, lng), {
        radius: 8,
        color: "#000",
        weight: 1,
        fill: true,
        fillColor: "#000",
        fillOpacity: 1,
    });

    map.addLayer(circle);
    circle.bringToFront(); // Need it to go in front of route lines

    $: circle.setLatLng(new L.LatLng(lat, lng));
    // $: circle.setTooltipContent(name); TODO: tooltips

    onDestroy(() => map.removeLayer(circle));
</script>