// /api/discord-card.js  (Node 18 runtime – no external deps)
export default async function handler(req, res) {
  /* ---------- 1.  CORS – allow any origin ---------- */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  /* ---------- 2.  basic validation ---------- */
  const uid = req.query.id;
  if (!uid) return res.status(400).json({ error: 'missing id' });

  /* ---------- 3.  env vars ---------- */
  const BOT_TOKEN = process.env.DISCORD_TOKEN;   // bot token
  const GUILD_ID  = process.env.DISCORD_GUILD_ID; // server you both share

  /* ---------- 4.  global user info ---------- */
  const userRes = await fetch(`https://discord.com/api/v10/users/${uid}`, {
    headers: { Authorization: `Bot ${BOT_TOKEN}` }
  });
  if (!userRes.ok) return res.status(404).json({ error: 'user not found' });
  const user = await userRes.json();

  /* ---------- 5.  guild member info (optional) ---------- */
  const memberRes = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${uid}`,
    { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
  );
  const member = memberRes.ok ? await memberRes.json() : null;

  /* ---------- 6.  presence (optional) ---------- */
  const presenceRes = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/presences/${uid}`,
    { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
  );
  const presence = presenceRes.ok ? await presenceRes.json() : null;
  const status = presence?.status ?? 'offline';

  /* ---------- 7.  build avatar url ---------- */
  const hash = member?.avatar ?? user.avatar;
  const ext  = hash?.startsWith('a_') ? 'gif' : 'png';
  const avatar = hash
    ? `https://cdn.discordapp.com/avatars/${uid}/${hash}.${ext}?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`;

  /* ---------- 8.  bio fallback ---------- */
  const displayName = member?.nick ?? user.global_name ?? user.username;
  const bio = member?.bio ?? `${user.username}#${user.discriminator}`;

  /* ---------- 9.  send tidy json ---------- */
  res.status(200).json({
    displayName,
    username: user.username,
    discriminator: user.discriminator,
    avatar,
    status,
    color: { online:'#43b581', idle:'#faa61a', dnd:'#f04747', offline:'#747f8d' }[status],
    bio,
    profileDeepLink: `discord://-/users/${uid}`
  });
}
