<script lang="ts" context="module">
    import * as L from "leaflet-lite";
    import fullBusSVG from "./bus-icon.svg?raw";

    function busIcon(): L.Icon {
        // TODO: possible to just use the `<svg>` element as the outer icon?
        const div = L.DomUtil.create('div', 'leaflet-marker-icon rts-bus-icon');
        
        div.innerHTML = fullBusSVG;
        div.style.transformOrigin = 'center';

        return new L.Icon(
            div,
            new L.Point(16, 32),
            new L.Point(8, 16),
        );
    }
</script>

<script lang="ts">
    import { getContext, onDestroy } from "svelte";
    import { MAP_CTX_KEY } from "./Map.svelte";
    import type { VehicleInfo } from "./api";

    export let info: VehicleInfo;
    export let color: string;

    const map = getContext<() => L.Map>(MAP_CTX_KEY)();
    const marker = new L.Marker(
        new L.LatLng(info.lat, info.lon),
        busIcon(),
    );

    map.addLayer(marker);

    $: marker.setLatLng(new L.LatLng(info.lat, info.lon));
    $: marker.setRotation(info.hdg);
    $: marker._icon.style.color = color;

    onDestroy(() => map.removeLayer(marker));
</script>