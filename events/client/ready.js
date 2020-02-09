const {prefix} = require('../../botsettings.json');

module.exports = async bot => {
  bot.user.setStatus("online");
  bot.user.setPresence({
  game: {
    name: `${prefix}help`,
    type: 'PLAYING'
   }
 });

  // Sends a message to a specific channel if desired. Insert the new channel ID after the get function.
  // bot.channels.get('channel ID here').send(`**${bot.user.username}** is ready to go!`);
}
