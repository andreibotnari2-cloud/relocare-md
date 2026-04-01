const TG_TOKEN = '8716780190:AAHQ6UgMBB7XQeOOlqMR0n-UA_gJn_EA0rg';
const TG_CHAT  = '-1003855483080';

// Persista in-memory cat timp functia e "warm" (cateva minute)
const ipVisits = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  // IP real din headerele Vercel
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .split(',')[0].trim();
  const pageUrl = req.body?.url || '';

  const WINDOW_MS = 5 * 60 * 1000; // 5 minute
  const THRESHOLD = 2;
  const now = Date.now();

  const stored = ipVisits.get(ip) || [];
  const recent = stored.filter(t => now - t < WINDOW_MS);
  recent.push(now);
  ipVisits.set(ip, recent);

  if (recent.length >= THRESHOLD) {
    const text =
      `⚠️ *ALERTĂ FRAUDĂ — Relocare.MD*\n\n` +
      `🌐 *IP:* \`${ip}\`\n` +
      `🔁 *Vizite în ultimele 5 min:* ${recent.length}\n` +
      `🕐 *Timp:* ${new Date().toLocaleString('ro-MD')}\n` +
      `🔗 *URL:* ${pageUrl}\n\n` +
      `⚡ Posibil comportament suspect sau spam!`;

    try {
      await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: 'Markdown' })
      });
    } catch (_) {}
  }

  res.json({ visits: recent.length, suspicious: recent.length >= THRESHOLD });
}
