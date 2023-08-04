<script lang="ts">
    import * as L from "leaflet-lite";
    import markerImageURL from "leaflet-lite/assets/marker.svg";
    import { getContext, onDestroy } from "svelte";
    import { MAP_CTX_KEY } from "./Map.svelte";
    import { show } from "./ModalContainer.svelte";
    import type { StopInfo } from "./api";
    import StopPredictionsModal from "./modals/StopPredictionsModal.svelte";
    import { stopsNear } from "./state/stops.state";

    const map = getContext<() => L.Map>(MAP_CTX_KEY)();
    const marker = new L.Marker(
        new L.LatLng(0, 0),
        L.defaultMarkerIcon(markerImageURL),
    );

    let selectedStop: StopInfo | undefined;

    function onMapClick(ev: any): void {
        const { lng, lat } = ev.latlng;
        
        selectedStop = stopsNear(lng, lat, 1)[0];

        if (selectedStop) {
            map.setView(
                new L.LatLng(selectedStop.lat, selectedStop.lon),
                16,
            );
            show(StopPredictionsModal, { stop: selectedStop }).catch(
                () => {}, // ignore cancelation
            ).finally(
                () => {
                    selectedStop = undefined;
                },
            );
        }
    }

    $: if (selectedStop) {
        marker.setLatLng(new L.LatLng(selectedStop.lat, selectedStop.lon));
        map.addLayer(marker);
    } else {
        map.removeLayer(marker);
    }

    map.on("click", onMapClick);

    onDestroy(() => {
        map.off("click", onMapClick);
        map.removeLayer(marker);
    });
</script>