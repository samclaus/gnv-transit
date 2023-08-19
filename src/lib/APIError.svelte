<script lang="ts">
    import { APIError } from "./api";

    export let title: string;
    export let err: unknown;
</script>

<aside>
    <h3>{title}</h3>
    {#if err instanceof APIError}
        <p>{err.message}</p>
        <p><em>
            If the above error is <strong>not</strong> something along the lines of "API key has exceeded
            its daily limit", please screenshot and
            <a href="mailto:hello@samcla.us">email it to me</a>. (The RTS servers only let my app
            make 10K individual requests per day, and that limit runs out quick when many people
            use the app.) Please include the response body below in your email.
        </em></p>
        {#if err.fullBody}
            <details>
                <summary>View HTTP response from server</summary>
                <p>
                    <strong>Status Code:</strong> {err.status}
                </p>
                <pre>{err.fullBody}</pre>
            </details>
        {/if}
    {:else}
        <p>
            Unable to reach the RTS server.
        </p>
        <ul>
            <li>Make sure you are connected to the internet via WiFi or cellular</li>
            <li>There could be a firewall or other technology blocking your access</li>
            <li>The RTS server(s) may be down</li>
        </ul>
    {/if}
</aside>

<style>
    aside {
        margin: 1em 0;

        padding: 8px;

        background-color: rgb(229 57 53 / .12);
        border: 1px solid rgb(229 57 53);
        border-radius: 6px;
    }

    pre {
        padding: 8px;

        background-color: #CFD8DC;
        border: 1px solid #607D8B;
        border-radius: 6px;

        overflow-x: auto;
    }
</style>