const { prefix } = require("../../botsettings.json");

module.exports = async (bot, message) => {

    // don't do anything if a message comes from another bot or a DM
    if (message.author.bot || message.channel.type === "dm") return;

/*
    // run this bit of code only if Coolitic#4065 sends a message in #manure-fields in the Ultimate Secret Society
    if (message.guild.id === "533658049622179860") {
      if (message.channel.id === "533676437945843763" && message.author.id === "134755756015616000") {
        return message.channel.send("https://ifunny.co/fun/vo8Uk4f97 <@134755756015616000>");
      }
    }
*/

    // makes sure prefix is case-insensitive
    let cleanPrefix = message.content.substr(0, prefix.length).toLowerCase();
    if (cleanPrefix != prefix) return;

    // grabs the command from the message
    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();

    let commandfile = bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd));
    if(commandfile) commandfile.run(bot, message, args);
}
