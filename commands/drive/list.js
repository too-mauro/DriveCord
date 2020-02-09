const { prefix } = require('../../botsettings.json');
const fs = require('fs');
const { google } = require('googleapis');

module.exports = {
  config: {
      name: "list",
      description: "Lists the most recent files of a user's Drive.",
      usage: "(number)",
      aliases: ["show"],
      permissions: ["None."],
      category: "drive"
  },
  run: async (bot, message, args) => {

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
      authorize(JSON.parse(content), listFiles);
    });

    /**
     * Create an OAuth2 client with the given credentials.
     * @param {Object} credentials The authorization client credentials.
     */
     function authorize(credentials, callback) {
      const {client_secret, client_id, redirect_uris} = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(
          client_id, client_secret, redirect_uris[0]);

      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) { return message.channel.send(`I'm not authorized for ${message.guild.name} yet! Please run \`${prefix}setup\` to get started.`); }
        oAuth2Client.setCredentials(JSON.parse(token));

        var numFiles = args[0];

        // check for arguments (not required)
        if (!args || args.length < 1) { numFiles = 10; }

        // check if argument is a number and within Google Drive API's list limit
        if (isNaN(numFiles)) {
          return message.channel.send(`**${message.author.username}**, please enter a number!`);
        }
        else if (numFiles < 1 || numFiles > 100) {
          return message.channel.send(`**${message.author.username}**, please choose a number between 1 and 100!`);
        }

        callback(oAuth2Client, numFiles);
      });
    }

    function listFiles(auth, numFiles) {
      const drive = google.drive({ version: 'v3', auth: auth });
      drive.files.list({
        pageSize: numFiles,
        orderBy: 'modifiedTime',
        fields: 'nextPageToken, files(id, name)',
      }, (err, response) => {
        if (err) {
          console.log(err);
          return message.channel.send("Something went wrong while listing your files! Please try again later.");
        }
        const files = response.data.files;
        if (files.length) {
          console.log(files);
          var fileMessage = "";
          console.log(`Files in Account associated with ${message.guild.name}:`);
          files.map((file) => {
            console.log(`${file.name} (${file.id})`);
            fileMessage += `${file.name} (ID: ${file.id})\n`;
          });
          return message.channel.send(`**${message.author.username}**, here are your ${files.length} most recently modified file(s):\n ${fileMessage}`);
        } else {
          console.log('No files found.');
          return message.channel.send(`**${message.author.username}**, no files were found.`);
        }
      });

    }
  }
}
