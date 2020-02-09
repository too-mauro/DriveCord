const fs = require('fs');

module.exports = (bot, guild) => {

  // delete the user's token file if it still exists (that is, they didn't disconnect their account)
  if (fs.existsSync(`./tokens/token_${guild.id}.json`)) {
    try {
      fs.unlinkSync(`./tokens/token_${guild.id}.json`);
      console.log(`bot left ${guild.name} (ID: ${guild.id}), server token file deleted!`);
    }
    catch (e) { console.log(e); }
  }

  // delete the temporary upload folder for the server if it exists
  if (fs.existsSync(`./temp-uploads/${guild.id}`)) {
    try {
      fs.rmdirSync(`./temp-uploads/${guild.id}`);
      console.log('server\'s upload folder successfully deleted');
    }
    catch (e) { console.log(e); }
  }

  // delete the rows associated with the server in the MySQL DB
  // insert SQL statements here

  // send a message to the logging channel
  bot.channels.get('625509713773199360').send(`---\n**LEFT A SERVER**\n${guild.name} (ID: ${guild.id})`).catch(console.error);
}
