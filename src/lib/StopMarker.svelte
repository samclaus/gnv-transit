<script lang="ts">
    import { getContext, onDestroy } from "svelte";
    import { MAP_CTX_KEY } from "./Map.svelte";
    import * as L from "leaflet-lite";
    import defaultMarkerURL from "leaflet-lite/assets/marker.svg";

    export let lat: number;
    export let lng: number;
    export let name: string;

    const map = getContext<() => L.Map>(MAP_CTX_KEY)();
    const marker = new L.Marker(new L.LatLng(lat, lng), L.defaultIcon(defaultMarkerURL));
    // const circle = new L.Circle(new L.LatLng(lat, lng), {
    //     radius: 20,
    //     color: "#000",
    //     weight: 1,
    //     fill: true,
    //     fillColor: "#000",
    //     fillOpacity: 1,
    // });

    map.addLayer(marker);
    // circle.bringToFront(); // Need it to go in front of route lines

    $: marker.setLatLng(new L.LatLng(lat, lng));
    // $: circle.setTooltipContent(name); TODO: tooltips

    onDestroy(() => map.removeLayer(marker));
</script>