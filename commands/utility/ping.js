module.exports = {
    config: {
        name: "ping",
        description: "PONG! Displays the API & bot latency.",
        usage: "",
        permissions: [""],
        category: "utility"
    },
    run: async (bot, message, args) => {

    message.channel.send("Pinging...").then(m => {
        let ping = m.createdTimestamp - message.createdTimestamp
        let choices = ["Is this really my ping?", "Is it okay? I can't look.", "I hope it isn't bad..."]
        let response = choices[Math.floor(Math.random() * choices.length)]

        m.edit(`${response}\nBot Latency: \`${ping}\`\nAPI Latency: \`${Math.round(bot.ping)}\``)
    })
  }
}
