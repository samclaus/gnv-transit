<script lang="ts">
    import { getContext, onDestroy } from "svelte";
    import { MAP_CTX_KEY } from "./Map.svelte";
    import * as L from "leaflet";
    import type { PatternInfo } from "./api";

    export let info: PatternInfo;
    export let color: string;

    const map = getContext<() => L.Map>(MAP_CTX_KEY)();
    const line = L.polyline(info.pt.map(({ lat, lon }) => [lat, lon]), {
        noClip: true,
        color,
        // weight: 1,
        // fill: true,
        // fillColor: color,
        // fillOpacity: 1,
    }).addTo(map).bringToBack(); // Need it to go behind the stops

    $: line.setLatLngs(info.pt.map(({ lat, lon }) => [lat, lon]));
    $: line.setStyle({ color });

    onDestroy(() => line.remove());
</script>