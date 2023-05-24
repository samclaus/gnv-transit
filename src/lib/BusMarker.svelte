<script lang="ts" context="module">
    import * as L from "leaflet";

    const BUS_ICON = L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0.664 196.52 394.314"><path d="M46.628.664h103.325a24 24 0 0 1 24 24v358.314a12 12 0 0 1-12 12H34.628a12 12 0 0 1-12-12V24.664a24 24 0 0 1 24-24Z" style="stroke:#000;stroke-width: 3;fill:currentColor"/><path d="M22.351 68.476h151.326V32.24c-2.365-21.742-148.961-21.742-151.326 0v36.236Z" style="stroke:#000;fill:#494b4d"/><ellipse cx="267.729" cy="89.628" rx="8.348" ry="10.987" style="stroke:#000;fill:#494b4d" transform="rotate(91.99367 225.6492652 49.13566959) skewX(-29.23203)"/><ellipse cx="267.729" cy="89.628" rx="8.348" ry="10.987" style="stroke:#000;fill:#494b4d" transform="matrix(-.034789 -.999395 -.979926 .594065 108.199465 252.462284)"/><path d="M313.228 209.419h3.456q3.455 0 4.679.267 1.223.266 1.994 1.362.771 1.096.771 3.496 0 2.192-.545 2.946t-2.145.904q1.45.36 1.948.963.499.603.621 1.107.121.505.121 2.777v4.952h-4.534v-6.239q0-1.507-.237-1.867-.238-.359-1.247-.359v8.465h-4.882Zm4.882 3.212v4.175q.823 0 1.154-.226.33-.227.33-1.467v-1.032q0-.893-.319-1.172-.318-.278-1.165-.278Zm17.741-3.212v3.757h-2.899v15.017h-4.882v-15.017h-2.888v-3.757Zm11.456 5.682h-4.534v-1.392q0-.974-.174-1.24-.174-.267-.58-.267-.441 0-.667.359-.226.36-.226 1.09 0 .94.255 1.415.244.476 1.38 1.148 3.259 1.937 4.105 3.178.847 1.24.847 4 0 2.006-.47 2.957-.469.951-1.815 1.595-1.345.643-3.131.643-1.959 0-3.345-.742-1.386-.742-1.815-1.89-.429-1.148-.429-3.259v-1.229h4.534v2.285q0 1.055.192 1.356.191.302.678.302.487 0 .725-.383.237-.382.237-1.136 0-1.658-.452-2.169-.464-.51-2.284-1.704-1.821-1.206-2.412-1.751-.592-.545-.98-1.508-.389-.962-.389-2.458 0-2.157.551-3.154.551-.998 1.78-1.56t2.969-.562q1.902 0 3.241.614 1.339.615 1.774 1.548.435.934.435 3.172Z" style="white-space:pre" transform="matrix(0 5.605348 -3.201367 0 798.97229 -1634.504395)"/></svg>`,
        className: "rts-marker-icon",
        iconSize: [16, 32],
    });
</script>

<script lang="ts">
    import { getContext, onDestroy } from "svelte";
    import { MAP_CTX_KEY } from "./Map.svelte";
    import type { VehicleInfo } from "./api";

    export let info: VehicleInfo;
    export let color: string;

    const map = getContext<() => L.Map>(MAP_CTX_KEY)();
    const marker = L.marker([info.lat, info.lon], {
        icon: BUS_ICON,
        rotationAngle: info.hdg,
        rotationOrigin: "center",
    }).addTo(map);

    $: marker.setLatLng([info.lat, info.lon]);
    $: marker.setRotationAngle(info.hdg);
    $: (marker as any)._icon.style.color = color;

    onDestroy(() => marker.remove());
</script>