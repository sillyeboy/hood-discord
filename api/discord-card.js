// /api/discord-card.js   —  GET ?id=DISCORD_USER_ID
import fetch from 'node-fetch';

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const BOT_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID  = process.env.DISCORD_GUILD_ID;   // server you both share

export default async function handler(req, res) {
  const uid = req.query.id;
  if (!uid) return res.status(400).json({ error:'missing id' });

  // 1. basic user info
  const userRes = await fetch(`https://discord.com/api/v10/users/${uid}`, {
    headers: { Authorization: `Bot ${BOT_TOKEN}` }
  });
  if (!userRes.ok) return res.status(404).json({ error:'user not found' });
  const user = await userRes.json();

  // 2. guild member info (nickname, avatar, roles)
  const memberRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${uid}`, {
    headers: { Authorization: `Bot ${BOT_TOKEN}` }
  });
  const member = memberRes.ok ? await memberRes.json() : null;

  // 3. presence (online / idle / dnd / offline)
  const presenceRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/presences/${uid}`, {
    headers: { Authorization: `Bot ${BOT_TOKEN}` }
  });
  const presence = presenceRes.ok ? await presenceRes.json() : null;
  const status = presence?.status ?? 'offline';

  // 4. build avatar url
  const hash = member?.avatar ?? user.avatar;
  const ext  = hash?.startsWith('a_') ? 'gif' : 'png';
  const avatar = hash
    ? `https://cdn.discordapp.com/guilds/${GUILD_ID}/users/${uid}/avatars/${hash}.${ext}?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator)%5}.png`;

  res.setHeader('Cache-Control','s-maxage=30, stale-while-revalidate=60');
  res.json({
    displayName: member?.nick ?? user.global_name ?? user.username,
    username:    user.username,
    discriminator: user.discriminator,
    avatar,
    status,
    color: { online:'#43b581', idle:'#faa61a', dnd:'#f04747', offline:'#747f8d' }[status],
    profileDeepLink: `discord://-/users/${uid}`
  });
}
