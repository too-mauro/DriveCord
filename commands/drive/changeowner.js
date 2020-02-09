const fs = require('fs');
const { prefix } = require('../../botsettings.json');
const {google} = require('googleapis');

module.exports = {
  config: {
      name: "changeowner",
      description: "Changes ownership of a file to a given Gmail address.",
      usage: "",
      aliases: ["chown"],
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
      authorize(JSON.parse(content), changeFileOwner);
    });


    function authorize(credentials, callback) {
      const {client_secret, client_id, redirect_uris} = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(
          client_id, client_secret, redirect_uris[0]);

      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) { return message.channel.send(`I'm not authorized for ${message.guild.name} yet! Please run \`${prefix}setup\` first before running this command.`); }
        oAuth2Client.setCredentials(JSON.parse(token));

        // get file ID from user
        message.channel.send(`**${message.author.username}**, please enter a file ID. Keep in mind the ID must be from one of the files this app has previously created, or this will not work. (Or type \`${prefix}quit\` to quit.)`).then(() => {
          message.channel.awaitMessages(response => response.content === `${prefix}quit` || response.content, {
            max: 1,
            time: 120000, // 2 minutes
            errors: ['time'],
          })
          .then((collected) => {
            if (collected.first().content.toLowerCase() === `${prefix}quit`) {
              console.log('change owner command cancelled');
              return message.channel.send(`The operation has been cancelled. Just run \`${prefix}changeowner\` again if you change your mind.`);
          }
            else {
              var fileID = collected.first().content;

              // get file ID from user
              message.channel.send(`**${message.author.username}**, please enter a valid Gmail or G Suite address. (Or type \`${prefix}quit\` to quit.)`).then(() => {
                message.channel.awaitMessages(response => response.content === `${prefix}quit` || response.content, {
                  max: 1,
                  time: 120000, // 2 minutes
                  errors: ['time'],
                })
                .then((collected) => {
                  if (collected.first().content.toLowerCase() === `${prefix}quit`) {
                    console.log('change owner command cancelled');
                    return message.channel.send(`The operation has been cancelled. Just run \`${prefix}changeowner\` again if you change your mind.`);
                }
                  else {
                    var emailAddress = collected.first().content;

                    // confirm with user before calling API
                    message.channel.send(`Ownership over the file with an ID of "${fileID}" will be transferred to **${emailAddress}**. That means you will be demoted to being a writer. Is that OK?\n(Type **yes** to continue or **no** to cancel.)`).then(() => {
                      message.channel.awaitMessages(response => response.content === 'yes' || response.content === 'y'|| response.content === 'no' || response.content === 'n', {
                        max: 1,
                        time: 30000, // 30 seconds
                        errors: ['time'],
                      })
                      .then((collected) => {
                        if (collected.first().content.toLowerCase() === 'yes' || collected.first().content.toLowerCase() === 'y') {
                          // call the Google API and change the permissions
                          return callback(oAuth2Client, fileID, emailAddress);
                      }
                        else if (collected.first().content.toLowerCase() === 'no' || collected.first().content.toLowerCase() === 'n') {
                          console.log('change owner command cancelled');
                          return message.channel.send("The operation has been cancelled. Just run this command again if you change your mind.");
                        }
                      })
                        .catch(() => { // time-out for yes/no confirmation
                          message.channel.send(`**${message.author.username}**, it seems you might need some more time, so I'm going to get back to doing what I need to do. Just run this command again whenever you're ready.`);
                        });
                    });

                  } // end else statement for getting email address
                })  // end .then from email address prompt
                  .catch(() => { // time-out for entering Gmail address
                    message.channel.send(`**${message.author.username}**, it seems you might need some more time, so I'm going to get back to doing what I need to do. Just run this command again whenever you're ready.`);
                  });
              })
              .catch(() => { // time-out for entering file ID
                message.channel.send(`**${message.author.username}**, it seems you might need some more time, so I'm going to get back to doing what I need to do. Just run this command again whenever you're ready.`);
              });


            }; // end else statement for file ID get
          }); // end file ID
      }); // end readline
    });
   }

    function changeFileOwner(auth, fileID, email) {
      const drive = google.drive({ version: 'v3', auth: auth });
      drive.permissions.create({
          resource: {
           role: 'owner',
           type: 'user',
           emailAddress: email
         },
          fileId: fileID,
          transferOwnership: true
        }, function (err, res) {
          if (err) {
            console.error(err);
            // Handle error...
            return message.channel.send(`Something went wrong while trying to transfer ownership!`);
          }
          else {
            console.log(res);
            return message.channel.send(`The file's ownership has been transferred to **${emailAddress}**.`);
          }
      });
    }

  }
}
