<script lang="ts">
    import * as L from "leaflet-lite";
    import { getContext, onDestroy } from "svelte";
    import { MAP_CTX_KEY } from "./Map.svelte";
    import type { PatternInfo } from "./api";

    export let info: PatternInfo;
    export let color: string;

    const map = getContext<() => L.Map>(MAP_CTX_KEY)();
    const line = new L.Polyline(info.pt.map(({ lat, lon }) => new L.LatLng(lat, lon)), {
        noClip: true,
        color,
        // weight: 1,
        // fill: true,
        // fillColor: color,
        // fillOpacity: 1,
    });

    map.addLayer(line);
    line.bringToBack(); // Need it to go behind the stops

    $: line.setLatLngs(info.pt.map(({ lat, lon }) => new L.LatLng(lat, lon)));
    $: line.setStyle({ color });

    onDestroy(() => map.removeLayer(line));
</script>
