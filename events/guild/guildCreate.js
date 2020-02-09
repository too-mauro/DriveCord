module.exports = (bot, guild) => {

  // create new rows for the server in the MySQL DB
  // insert SQL statements here

  // send a message to the logging channel
  bot.channels.get('625509713773199360').send(`---\n**JOINED A NEW SERVER**\n${guild.name} (ID: ${guild.id})`).catch(console.error);
}
