const {prefix} = require('../../botsettings.json');
const fs = require('fs');
const {google} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

module.exports = {
  config: {
      name: "setup",
      description: "Authorizes the bot to use a user's Google Drive.",
      usage: "",
      aliases: ["start", "init", "login"],
      permissions: ["Manage Server"],
      category: "drive"
  },
  run: async (bot, message, args) => {

    // check for 'manage server' / 'administrator' privileges
    if (!message.guild.member(message.author).hasPermission("MANAGE_SERVER") || !message.guild.member(message.author).hasPermission("ADMINISTRATOR")) {
      return message.channel.send(`**${message.author.username}**, you need to have the \`Manage Server\` or \`Administrator\` permissions to use this command!`);
    }

    // The file token_${server's ID}.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = `./tokens/token_${message.guild.id}.json`;

    // Load client secrets from a local file.
    fs.readFile('./auth.json', (err, content) => {
      if (err) {
        console.log('Error loading client secret file: ', err);
        return message.channel.send("Something went wrong while trying to read the client secret file! Please try again later.");
      }
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content));
    });

    /**
     * Create an OAuth2 client with the given credentials.
     * @param {Object} credentials The authorization client credentials.
     */
     function authorize(credentials) {
      const {client_secret, client_id, redirect_uris} = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(
          client_id, client_secret, redirect_uris[0]);

      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client);
        oAuth2Client.setCredentials(JSON.parse(token));
        return message.channel.send(`I'm already authorized for ${message.guild.name}. No need to run this again!`);
      });
    }

    /**
     * Get and store new token after prompting for user authorization.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     */
    function getAccessToken(oAuth2Client) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      message.channel.send(`Hey, **${message.author.username}**, and welcome to DriveCord! This is an application to share your Google Drive files with your fellow server members. You'll need to log in with a Google account before you can use this app, so please authorize me by visiting this URL:\n${authUrl}\n\nEnter the code from that page here. (Or type \`${prefix}quit\` to quit.)`).then(() => {
        message.channel.awaitMessages(response => response.content || response.content == `${prefix}quit`, {
          max: 1,
          time: 30000,
          errors: ['time'],
        })
        .then((collected) => {
          if (collected.first().content == `${prefix}quit`) {
            return message.channel.send(`Setup has been cancelled. Just run \`${prefix}setup\` again whenever you're ready.`);
          }
          else {
            var code = collected.first().content;
            oAuth2Client.getToken(code, (err, token) => {
              if (err) {
                console.error(`Error retrieving access token: ${err}`);
                return message.channel.send("Something went wrong while trying to get the access token! Maybe you entered the wrong code...?");
              }
              oAuth2Client.setCredentials(token);
              // Store the token to disk for later program executions
              fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) {
                  console.error(err);
                  return message.channel.send("Something went wrong while trying to store the access token! Try again later.");
                }
                console.log('Token successfully stored to', TOKEN_PATH);

                // create an upload folder for the server (if it doesn't exist already) so other server uploads won't get mixed up
                if (!fs.existsSync(`./temp-uploads/${message.guild.id}`)) {
                  fs.mkdirSync(`./temp-uploads/${message.guild.id}`);
                  console.log(`upload folder created for ${message.guild.name} (ID: ${message.guild.id})`);
                }
                console.log(`upload folder already exists for ${message.guild.name} (ID: ${message.guild.id})`);

                message.channel.send(`You have successfully signed in and this app is now authorized for ${message.guild.name}. Now you can use the rest of the commands!`);
              });
            });
          }
        });
      })
      .catch(() => {
          message.channel.send(`**${message.author.username}**, it seems you might need some more time, so I'm going to get back to doing what I need to do. Just run this command again whenever you're ready.`);
      });
    }

  }
}
