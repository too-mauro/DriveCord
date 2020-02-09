const fs = require('fs');
const { prefix } = require('../../botsettings.json');

module.exports = {
  config: {
      name: "terminate",
      description: "Deauthorizes the bot for the server.",
      usage: "",
      aliases: ["end", "logout"],
      permissions: ["Manage Server"],
      category: "drive"
  },
  run: async (bot, message, args) => {

    // check for permissions
    if (!message.guild.member(message.author).hasPermission("MANAGE_SERVER") || !message.guild.member(message.author).hasPermission("ADMINISTRATOR")) {
      return message.channel.send(`**${message.author.username}**, you need to have the \`Manage Server\` or \`Administrator\` permissions to use this command!`);
    }

    const TOKEN_PATH = `./tokens/token_${message.guild.id}.json`;

    // check if a token is already stored (doesn't matter if it's expired or not)
    if (!fs.existsSync(TOKEN_PATH)) {
      console.log(`${TOKEN_PATH} does not exist`);
      return message.channel.send(`I haven't been authorized for ${message.guild.name} yet! Please run \`${prefix}setup\` to set up a Google account.`);
    }

    // asks the message's author if they want to deauthorize the app
    message.channel.send(`Hey, **${message.author.username}**, are you sure you want to deauthorize me? You'll have to run \`${prefix}setup\` again if you do.\n(Type **yes** to continue or **no** to cancel.)`)
      .then(() => {
    message.channel.awaitMessages(response => response.content === 'yes' || response.content === 'y'|| response.content === 'no' || response.content === 'n', {
      max: 1,
      time: 90000,
      errors: ['time'],
    })
    .then((collected) => {
      if (collected.first().content.toLowerCase() === 'yes' || collected.first().content.toLowerCase() === 'y') {
        try {
          fs.unlinkSync(TOKEN_PATH);
          console.log(`successfully deleted ${TOKEN_PATH}`);
        }
        catch (err) {
          console.log(err);
          return message.channel.send("Something went wrong while trying to deauthorize! Please try again later.");
        }
        message.channel.send(`You have successfully signed out. To log in again with the current account or set up another Google account, run \`${prefix}setup\` again.`);
    }
      if (collected.first().content.toLowerCase() === 'no' || collected.first().content.toLowerCase() === 'n') {
        console.log('terminate command cancelled');
        return message.channel.send(`The operation has been cancelled. Just run \`${prefix}terminate\` again if you change your mind.`);
      }
    })
      .catch(() => {
        message.channel.send(`**${message.author.username}**, it seems you might need some more time, so I'm going to get back to doing what I need to do. Just run \`${prefix}terminate\` again whenever you're ready.`);
      });
    });
  }
}
