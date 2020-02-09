'use strict';
const { Client, Collection } = require("discord.js");
const { token } = require("./botsettings.json");
const bot = new Client();

["aliases", "commands"].forEach(x => bot[x] = new Collection());
["console", "command", "event"].forEach(x => require(`./handlers/${x}`)(bot));

bot.login(token);
console.log("Bot user DriveCord connected to Discord!");
