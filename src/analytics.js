const WORKER = 'https://capimeta.agenciaacvip.workers.dev';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getCookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? m[1] : undefined;
}

function getFbc() {
  const stored = getCookie('_fbc');
  if (stored) return stored;
  const fbclid = new URLSearchParams(window.location.search).get('fbclid');
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
}

function sendToCAPI(eventName, eventId) {
  fetch(WORKER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      data: [{
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: window.location.href,
        action_source: 'website',
        user_data: {
          fbp: getCookie('_fbp'),
          fbc: getFbc(),
        },
      }],
    }),
  }).catch(() => {});
}

export function trackLead() {
  const id = uid();
  if (window.fbq) window.fbq('track', 'Lead', {}, { eventID: id });
  sendToCAPI('Lead', id);
}
