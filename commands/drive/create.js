const { prefix } = require('../../botsettings.json');
const fs = require('fs');
const {google} = require('googleapis');

module.exports = {
  config: {
      name: "create",
      description: "Creates a new document, spreadsheet, or presentation.",
      usage: "<doc/sheet/slide> <file name>",
      aliases: ["make", "new", "cf"],
      permissions: ["None."],
      category: "drive"
  },
  run: async (bot, message, args) => {

    // check if token exists and isn't expired
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
      authorize(JSON.parse(content), createFile);
    });


    function authorize(credentials, callback) {
      const {client_secret, client_id, redirect_uris} = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(
          client_id, client_secret, redirect_uris[0]);

      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) { return message.channel.send(`I'm not authorized for ${message.guild.name} yet! Please run \`${prefix}setup\` first before running this command.`); }
        oAuth2Client.setCredentials(JSON.parse(token));

      // check for proper arguments (the file type and file name)
      if (!args || args.length < 2) {
        return message.channel.send(`**${message.author.username}**, please enter a file type and a name for the file.\nUsage: ${prefix}create <document/spreadsheet/presentation> <file name>`);
      }

      // initialize the individual arguments
      var fileType = args[0];
      var fileName = args.slice(1).join(" ");

      // check for file type, and adjust aliases so we can use them in the Google API call
      if (fileType == "d" || fileType == "doc" || fileType == "document") {
        fileType = "document";
      }
      else if (fileType == "sl" || fileType == "slide" || fileType == "presentation") {
        fileType = "presentation";
      }
      else if (fileType == "sh" || fileType == "sheet" || fileType == "spreadsheet") {
        fileType = "spreadsheet";
      }
      else {
        return message.channel.send(`**${message.author.username}**, that is not a supported file type! I can only make documents, spreadsheets, and presentations at this time. Please try again. Here are some aliases for reference:\n` +
          "-`d` and `doc` for document\n-`sl` and `slide` for presentation\n-`sh` and `sheet` for spreadsheet");
      }

      // confirm with user before calling API
      message.channel.send(`A new ${fileType} named "${fileName}" will be created. Is that OK?\n(Type **yes** to continue or **no** to cancel.)`).then(() => {
        message.channel.awaitMessages(response => response.content === 'yes' || response.content === 'y'|| response.content === 'no' || response.content === 'n', {
          max: 1,
          time: 30000,
          errors: ['time'],
        })
        .then((collected) => {
          if (collected.first().content.toLowerCase() === 'yes' || collected.first().content.toLowerCase() === 'y') {
            // call the Google API and create the file
            callback(oAuth2Client, fileType, fileName);
        }
          else if (collected.first().content.toLowerCase() === 'no' || collected.first().content.toLowerCase() === 'n') {
            console.log('create command cancelled');
            return message.channel.send("The operation has been cancelled. Just run this command again if you change your mind.");
          }
        })
          .catch(() => {
            message.channel.send(`**${message.author.username}**, it seems you might need some more time, so I'm going to get back to doing what I need to do. Just run this command again whenever you're ready.`);
          });
        });
      });
    }

    function createFile(auth, fileType, fileName) {
      const drive = google.drive({ version: 'v3', auth: auth });
      drive.files.create({
        resource: {
          name: `${fileName}`,
          mimeType: `application/vnd.google-apps.${fileType}`,
        },
        media: {
          mimeType: `application/vnd.google-apps.${fileType}`,
          body: '',
        }
      }, function(err, result){
          if (err) {
            console.log(err);

            // if the error says invalid_grant, that means the user deauthorized DriveCord before running a command. If that's the case, delete the token file and tell user it can't do anything until they sign in again.
            if (err == "Error: invalid_grant") {
              try {
                fs.unlinkSync(TOKEN_PATH);
                console.log(`successfully deleted ${TOKEN_PATH}`);
              }
              catch (err) { console.log(err); }
              return message.channel.send(`This app is no longer authorized for the Google account associated with ${message.guild.name}. To reauthorize the current account or set up another Google account, run \`${prefix}setup\` again.`);
            }
            // if not, return a generic error message
            return message.channel.send("Something wrong happened while trying to create your file! Please try again later.");
          }
          else {
            console.log(result);

            // check if it's a spreadsheet. Need to change the file type slightly in the URL or else it won't work
            if (fileType == "spreadsheet") {
              return message.channel.send(`The file \`${fileName}\` has been created successfully. Here's the link:\nhttps://docs.google.com/spreadsheets/d/${result.data.id}`);
            }

            // let user know file is created, and return a shareable link
            return message.channel.send(`The file \`${fileName}\` has been created successfully. Here's the link:\nhttps://docs.google.com/${fileType}/d/${result.data.id}`);
          }
      });
    }

  }
}
