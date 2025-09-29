// /api/discord-card.js  (Node 18)
export default async function handler(req, res) {
  /* ---------- CORS ---------- */
  res.setHeader('Access-Control-Allow-Origin', '*');

  const uid = req.query.id;
  if (!uid) return res.status(400).json({ error: 'missing id' });

  const token = process.env.DISCORD_TOKEN;
  const guild = process.env.DISCORD_GUILD_ID;

  /* ---------- global user ---------- */
  const userRes = await fetch(`https://discord.com/api/v10/users/${uid}`, {
    headers: { Authorization: `Bot ${token}` }
  });
  if (!userRes.ok) return res.status(404).json({ error: 'user not found' });
  const user = await userRes.json();

  /* ---------- guild extras (optional) ---------- */
  const memberRes = await fetch(
    `https://discord.com/api/v10/guilds/${guild}/members/${uid}`,
    { headers: { Authorization: `Bot ${token}` } }
  );
  const member = memberRes.ok ? await memberRes.json() : null;

  const presenceRes = await fetch(
    `https://discord.com/api/v10/guilds/${guild}/presences/${uid}`,
    { headers: { Authorization: `Bot ${token}` } }
  );
  const presence = presenceRes.ok ? await presenceRes.json() : null;
  const status = presence?.status ?? 'offline';

  /* ---------- avatar ---------- */
  const hash = member?.avatar ?? user.avatar;
  const ext  = hash?.startsWith('a_') ? 'gif' : 'png';
  const avatar = hash
    ? `https://cdn.discordapp.com/avatars/${uid}/${hash}.${ext}?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`;

  /* ---------- reply ---------- */
  res.json({
    displayName: member?.nick ?? user.global_name ?? user.username,
    username: user.username,
    discriminator: user.discriminator,
    avatar,
    status,
    color: { online: '#43b581', idle: '#faa61a', dnd: '#f04747', offline: '#747f8d' }[status],
    bio: member?.bio ?? `${user.username}#${user.discriminator}`,
    profileDeepLink: `discord://-/users/${uid}`
  });
}
