import { Router } from 'express';
import axios from 'axios';
const router = Router();
async function getSpotifyAccessToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret)
        throw new Error('Missing Spotify credentials');
    const tokenRes = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({ grant_type: 'client_credentials' }).toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        },
    });
    return tokenRes.data.access_token;
}
router.get('/playlists', async (_req, res) => {
    try {
        const token = await getSpotifyAccessToken();
        const q = encodeURIComponent('lofi calm focus OR relax');
        const searchRes = await axios.get(`https://api.spotify.com/v1/search?type=playlist&limit=12&q=${q}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const playlists = searchRes.data.playlists.items.map((p) => ({
            id: p.id,
            name: p.name,
            externalUrl: p.external_urls?.spotify,
            images: p.images,
            owner: p.owner?.display_name,
        }));
        res.json(playlists);
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch Spotify playlists' });
    }
});
router.get('/playlist/:id/tracks', async (req, res) => {
    try {
        const token = await getSpotifyAccessToken();
        const { id } = req.params;
        const tracksRes = await axios.get(`https://api.spotify.com/v1/playlists/${encodeURIComponent(id)}/tracks?limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const items = tracksRes.data.items.map((it) => it.track).filter(Boolean);
        const tracks = items
            .map((t) => ({
            id: t.id,
            title: t.name,
            artist: (t.artists || []).map((a) => a.name).join(', '),
            image: t.album?.images?.[0]?.url,
            previewUrl: t.preview_url, // 30s preview
            externalUrl: t.external_urls?.spotify,
        }))
            .filter((t) => !!t.previewUrl);
        res.json(tracks);
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch playlist tracks' });
    }
});
export default router;
