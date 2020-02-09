const { ownerID, prefix } = require("../../botsettings.json");

module.exports = {
    config: {
        name: "reload",
        description: "reloads a bot command!",
        usage: "<category> <command name>",
        category: "owner",
        permissions: ["Bot Owner"],
        aliases: ["creload"]
    },
    run: async (bot, message, args) => {
      return message.channel.send("This command is in the works, please wait until it's finished...");

      // since this is a bot owner command, check the author's ID against the bot owner's
      if (message.author.id !== ownerID) {
        return message.channel.send(`**${message.author.username}**, you're not the bot owner!`);
      }

      // check for proper arguments
      if (!args || args.length < 2) {
        return message.channel.send(`**${message.author.username}**, please provide a command to reload!\nUsage: ${prefix}reload <category> <command name>`);
      }

      // get the category and command from the user
      let categoryName = args[0];
      let commandName = args[1];

      try {
          delete require.cache[require.resolve(`./commands/${categoryName}/${commandName}.js`)];
          bot.commands.delete(commandName);
          const pull = require(`./commands/${categoryName}/${commandName}.js`);
          bot.commands.set(commandName, pull);
      } catch(e) {
          return message.channel.send(`Could not reload the **${commandName}** command in the *${categoryName}* category! Maybe you typed something incorrectly...?`);
      }

      message.channel.send(`The command \`${commandName}\` has been reloaded!`);
    }
}
