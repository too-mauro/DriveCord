const { fbChannelID } = require('../../botsettings.json');

module.exports = {
  config: {
      name: "feedback",
      description: "Sends feedback to my developer!",
      usage: "<feedback message>",
      aliases: ["fb"],
      permissions: [""],
      category: "utility"
  },
  run: async (bot, message, args) => {

    // check for arguments
    if (!args || args.length < 1) {
      return message.channel.send("Hey there, got some feedback you want to give the developer? " +
      "You need to provide a message, first!");
    }

    // grabs the message, checks if the feedback channel exists, sends the message if it does, and tells the user it was a success
    let text = args.join(" ");
    let fbChannel = bot.channels.get(fbChannelID);
    if (!fbChannel.deleted) {
    fbChannel.send(`---\n**${message.author.tag}**:\n` + text);
    message.channel.send("Your message has been sent. Thanks!").catch(console.error);
  }
  else {
    return message.channel.send("Whoops! We couldn't send your message...!");
  }
  }
}
