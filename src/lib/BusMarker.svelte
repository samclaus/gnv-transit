<script lang="ts" context="module">
    import * as L from "leaflet-lite";
    import defaultIconURL from "leaflet-lite/assets/marker.svg";
    import fullBusSVG from "./bus-icon.svg?raw";

    function busIcon(): L.Icon {
        const div = document.createElement('div');
        div.innerHTML = fullBusSVG;

        const svg = div.firstChild as HTMLElement;
        svg.remove();
        svg.style.width = '16px';
        svg.style.height = '32px';
        svg.style.transformOrigin = 'center';
        svg.style.color = 'orange';

        return new L.Icon(
            svg,
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
        // { rotation: info.hdg },
    );

    map.addLayer(marker);

    $: marker.setLatLng(new L.LatLng(info.lat, info.lon));
    // $: marker.setRotation(info.hdg);
    $: marker._icon.style.color = color;

    onDestroy(() => map.removeLayer(marker));
</script>