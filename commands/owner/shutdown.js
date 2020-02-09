const { ownerID } = require("../../botsettings.json");

module.exports = {
    config: {
        name: "shutdown",
        description: "Shuts down the bot!",
        usage: "",
        category: "owner",
        permissions: ["Bot Owner"],
        aliases: ["botstop", "restart", "sd"]
    },
    run: async (bot, message, args) => {

    if(message.author.id != ownerID) return message.channel.send("You're not the bot owner!")

    try {
        await message.channel.send(`${bot.user.username} is shutting down...`);
        process.exit(0);
    }
    catch(e) {
        message.channel.send(`ERROR: ${e.message}`);
    }

    }
}
