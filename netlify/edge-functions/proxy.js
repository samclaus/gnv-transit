
export default async (req, ctx) => {
    const url = new URL(req.url);
    const key = Netlify.env.get("VITE_RTS_API_KEY");

    let btURL = `https://riderts.app/bustime/api/v3${url.pathname}?key=${key}&format=json`;

    for (const [key, val] of url.searchParams) {
        btURL += `&${key}=${val}`;
    }

    const res = await fetch(btURL);
    const resJSON = await res.text();

    console.log(url.pathname);

    return new Response(resJSON);
}

export const config = {
    path: [
        "/getroutes",
        "/getdirections*",
        "/getpatterns*",
        "/getstops*",
        "/getvehicles*",
        "/getpredictions*",
    ],
};