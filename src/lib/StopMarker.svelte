<script lang="ts">
    import { getContext, onDestroy } from "svelte";
    import { MAP_CTX_KEY } from "./Map.svelte";
    import * as L from "leaflet";

    export let lat: number;
    export let lng: number;
    export let name: string;

    const map = getContext<() => L.Map>(MAP_CTX_KEY)();
    const circle = L.circle([lat, lng], {
        radius: 20,
        color: "#000",
        weight: 1,
        fill: true,
        fillColor: "#000",
        fillOpacity: 1,
    }).bindTooltip(name).addTo(map).bringToFront(); // Need it to go in front of route lines

    $: circle.setLatLng([lat, lng]);
    $: circle.setTooltipContent(name);

    onDestroy(() => circle.remove());
</script>