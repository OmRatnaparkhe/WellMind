export function requestPlayPlaylist(playlistId: string) {
  try {
    const ev = new CustomEvent('music:playPlaylist', { detail: { playlistId } });
    window.dispatchEvent(ev);
  } catch {
    // Fallback for older browsers
    (window as any).dispatchEvent({ type: 'music:playPlaylist', detail: { playlistId } });
  }
}


