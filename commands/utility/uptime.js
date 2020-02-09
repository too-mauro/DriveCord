module.exports = {
    config: {
        name: "uptime",
        description: "Displays the bot's current uptime!",
        usage: "",
        category: "utility",
        permissions: [""],
        aliases: ["ut"]
    },
    run: async (bot, message, args) => {

    function duration(ms) {
        const sec = Math.floor((ms / 1000) % 60).toString()
        const min = Math.floor((ms / (1000 * 60)) % 60).toString()
        const hrs = Math.floor((ms / (1000 * 60 * 60)) % 60).toString()
        return `${hrs} hours, ${min} minutes, and ${sec} seconds.`
    }

    message.channel.send(`I have been online for: ${duration(bot.uptime)}`)

    }
}
