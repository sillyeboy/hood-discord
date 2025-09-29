// /api/discord-card.js
export default async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');   // FIRST line
  const uid = req.query.id;
  if (!uid) return res.status(400).json({ error: 'missing id' });

  const token = process.env.DISCORD_TOKEN;
  const userRes = await fetch(`https://discord.com/api/v10/users/${uid}`, {
    headers: { Authorization: `Bot ${token}` }
  });
  if (!userRes.ok) return res.status(404).json({ error: 'user not found' });
  const user = await userRes.json();

  const avatar = user.avatar
    ? `https://cdn.discordapp.com/avatars/${uid}/${user.avatar}.png?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`;

  res.json({
    displayName: user.global_name ?? user.username,
    username: user.username,
    discriminator: user.discriminator,
    avatar,
    status: 'offline',
    bio: `${user.username}#${user.discriminator}`,
    profileDeepLink: `discord://-/users/${uid}`
  });
}
