// Polite screen-reader announcements through the #announcer live region.

export function announce(message) {
  const region = document.getElementById('announcer');
  if (!region) return;
  // Clearing first makes repeated identical messages be announced again.
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}
