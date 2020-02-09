module.exports = {
  config: {
      name: "invite",
      aliases: ["inv"],
      description: "Give out an invite link to the support server!",
      usage: "",
      permissions: [""],
      category: "utility"
  },
  run: async (bot, message, args) => {
    return message.channel.send("Need some help with something? Check out my server!\n[support server link here]");
}
