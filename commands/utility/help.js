const { RichEmbed } = require("discord.js");
const { prefix } = require("../../botsettings.json");
const { readdirSync } = require("fs");
const { stripIndents } = require("common-tags");
const { cyan } = require("../../colours.json");

module.exports = {
    config: {
        name: "help",
        aliases: ["h", "commands"],
        usage: "(command)",
        category: "utility",
        description: "Displays all commands that the bot has.",
    },
    run: async (bot, message, args) => {
        const embed = new RichEmbed()
            .setColor(cyan)
            .setAuthor(`${bot.user.username} Help`, message.guild.iconURL)
            .setThumbnail(bot.user.displayAvatarURL)

        if(!args[0]) {
            const categories = readdirSync("./commands/")

            embed.setDescription(`These are the avaliable commands for ${bot.user.username}\nThe bot prefix is: **${prefix}**`)
            embed.setFooter(`© ${bot.user.username} | Total Commands: ${bot.commands.size}`, bot.user.displayAvatarURL);

            categories.forEach(category => {
                const dir = bot.commands.filter(c => c.config.category === category)
                const capitalise = category.slice(0, 1).toUpperCase() + category.slice(1)
                try {
                    embed.addField(`❯ ${capitalise} [${dir.size}]:`, dir.map(c => `\`${c.config.name}\``).join(" "))
                } catch(e) {
                    console.log(e)
                }
            })

            return message.channel.send(embed)
        } else {
            let command = bot.commands.get(bot.aliases.get(args[0].toLowerCase()) || args[0].toLowerCase())
            if(!command) return message.channel.send(embed.setTitle("Invalid Command.").setDescription(`Do \`${prefix}help\` for the list of the commands.`))
            command = command.config

            embed.setDescription(stripIndents`The bot's prefix is: \`${prefix}\`\n
            **Command:** ${command.name.slice(0, 1).toUpperCase() + command.name.slice(1)}
            **Description:** ${command.description || "No Description provided."}
            **Usage:** ${command.usage ? `\`${prefix}${command.name} ${command.usage}\`` : "No Usage"}
            **User Permissions Required:** ${command.permissions ? command.permissions.join(", ") : "None."}
            **Aliases:** ${command.aliases ? command.aliases.join(", ") : "None."}`)

            return message.channel.send(embed)
        }
    }
}
