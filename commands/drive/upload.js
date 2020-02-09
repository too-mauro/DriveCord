const {prefix} = require('../../botsettings.json');
const fs = require('fs');
const {google} = require('googleapis');
const request = require('request');

module.exports = {
  config: {
      name: "upload",
      description: "Uploads a file to a user's Google Drive.",
      usage: "<file upload>",
      aliases: ["up"],
      permissions: ["None."],
      category: "drive"
  },
  run: async (bot, message, args) => {

    const TOKEN_PATH = `./tokens/token_${message.guild.id}.json`;

    // Load client secrets from a local file.
    fs.readFile('./auth.json', (err, content) => {
      if (err) {
        console.log('Error loading client secret file: ', err);
        return message.channel.send("Something went wrong while trying to read the client secret file! Please try again later.");
      }
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), uploadFile);
    });

    function authorize(credentials, callback) {
      const {client_secret, client_id, redirect_uris} = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(
          client_id, client_secret, redirect_uris[0]);

      // Check if we have previously stored a token. If not, tell the user to run the setup command.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) { return message.channel.send(`I'm not authorized for ${message.guild.name} yet! Please run \`${prefix}setup\` to get started.`); }
        oAuth2Client.setCredentials(JSON.parse(token));

        // return if an attachment wasn't sent
        if(!message.attachments.first()) {
          return message.channel.send(`**${message.author.username}**, please upload a file when you call this command.\nUsage: ${prefix}upload <file attachment>\n\nSupported file types: \`.doc\`, \`.docx\`, \`.odt\`, \`.txt\`, \`.pdf\`,\`.ppt\`, \`.pptx\`, \`.odp\`, \`.xls\`, \`.xlsx\`, \`.ods\`, \`.csv\``);
        }

        var fullFileName = message.attachments.first().filename;
        var fileName = fullFileName.split(".")[0].replace(/_/g, " ");
        var fileExtension = fullFileName.split(".")[1];
        var allowedFileTypes = ['doc', 'docx', 'odt', 'txt', 'pdf', 'ppt', 'pptx', 'odp', 'xls', 'xlsx', 'ods', 'csv'];
        var mimeTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.oasis.opendocument.text', 'text/plain', 'application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.oasis.opendocument.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/oleobject', 'text/csv'];

        // check file type against list of accepted ones
        // if it matches, download the file through Discord.js, get the file's MIME type, and upload it with the Google Drive API
        for (let i = 0; i < allowedFileTypes.length; i++) {
          if (fileExtension == allowedFileTypes[i]) {
            // get the file's corresponding MIME type so we can use this in the Drive API call
            var fileMimeType = mimeTypes[i];
            console.log(`file mime type: ${fileMimeType}`);
            // download the file
            request.get(message.attachments.first().url).on('error', console.error).pipe(fs.createWriteStream(`./temp-uploads/${message.guild.id}/${fileName}.${fileExtension}`));

            return callback(oAuth2Client, fileName, fileExtension, fileMimeType);
          }
        }
        message.channel.send(`**${message.author.username}**, your file isn't supported. Please try again.\n\nSupported file types: \`.doc\`, \`.docx\`, \`.odt\`, \`.txt\`, \`.pdf\`,\`.ppt\`, \`.pptx\`, \`.odp\`, \`.xls\`, \`.xlsx\`, \`.ods\`, \`.csv\``);
      });
    }

    /**
    * Describe with given media and metaData and upload it using google.drive.create method()
    */
    async function uploadFile(auth, fileName, fileExtension, fileMimeType) {
      const drive = google.drive({version: 'v3', auth: auth});
      await drive.files.create({
        resource: {
          'name': `${fileName}.${fileExtension}`
        },
        media: {
          //uploadType: 'media',
          //mimeType: `${fileMimeType}`,
          body: fs.createReadStream(`temp-uploads/${message.guild.id}/${fileName}.${fileExtension}`)
        }
      }, function (err, result) {
        if (err) {
          // Handle error
          console.log(err);

          // delete the file from the uploads folder so it doesn't stay on the bot's file system
          try {
            fs.unlinkSync(`./temp-uploads/${message.guild.id}/${fileName}.${fileExtension}`);
            console.log(`successfully deleted ${fileName}.${fileExtension} from temp upload folder`);
          }
          catch (e) { console.log(e); }

          return message.channel.send("Something went wrong while trying to upload the file! Please try again later.");
        }
        else {
          console.log(result);

          // delete the file from the uploads folder so it doesn't stay on the bot's file system
          try {
            fs.unlinkSync(`./temp-uploads/${message.guild.id}/${fileName}.${fileExtension}`);
            console.log(`successfully deleted ${fileName}.${fileExtension} from temp upload folder`);
          }
          catch (e) { console.log(e); }
          return message.channel.send(`The file \`${fileName}.${fileExtension}\` was successfully uploaded.`);
        }
      });
    }

  }
}
