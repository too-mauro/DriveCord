# DriveCord
A bot that connects to the Google Drive API and uses account credentials to send and receive information. Its main goal is to create, upload, and change ownership of files on a user's Google Drive account from Discord. It uses OAuth2 to authenticate users and uses access tokens to enable application programming interface (API) calls. Under the hood, it runs on Node.js, a server-side JavaScript solution.

## Getting Started
To start using it, invite the DriveCord bot to a Discord server of choice through [this link](https://discordapp.com/oauth2/authorize?&client_id=625423183876718593&scope=bot&permissions=117760) (the **'Manage Server'** permission on a given server is required to invite it there).

A good place to start after inviting the bot is the **setup** command, which will set up a Google account using OAuth2. (This command requires the **'Manage Server'** permission to use it!) By default, this will run by entering "**d!setup**" in the Discord client.

Once you follow the prompts, you'll be able to create and upload files to the Google Drive account of your choice!

![create](https://user-images.githubusercontent.com/49416852/71220535-d740ac00-2296-11ea-84ae-ab3bfc6c7c9f.png)

![upload](https://user-images.githubusercontent.com/49416852/71220551-e9bae580-2296-11ea-9cff-2bdebf36de84.png)
## Command List
### Drive Commands
- **setup**: Authorizes the bot to use a Google Drive account. Necessary to use first before running any of the other commands in this category as they all require authorization to run.
- **list**: Lists all the files created through the DriveCord bot. Takes a number as an argument (list *number*), default is 10.
- **create**: Creates a new document, spreadsheet, or presentation. Takes the type of file and file's name as arguments (create document/spreadsheet/presentation *file name*).
- **upload**: Uploads a file to the Google Drive account associated with the server. (Attach a file while typing the upload command.)
- **changeowner**: Changes ownership of a file to another Google Drive account. Asks for the Gmail address of the new account and the ID of the file in question in an interactive prompt.
- **terminate**: Disconnects the user's Google Drive account from DriveCord. Asks for confirmation before disconnecting. After this point, re-authorization is necessary.

### Utility Commands
- **feedback**: Sends feedback to the DriveCord developer. (feedback *message to send*)
- **help**: The help command; shows all available commands the bot has.
- **invite**: Invites the bot to the support server.
- **ping**: Tests the current time taken for the bot to respond.
- **uptime**: Shows how long the bot has been up and running.

## Deploying DriveCord
**A quick note: this guide assumes you are using a machine running Ubuntu Linux 18.04 (the latest long-term support release at the time of this writing).**

### Creating a Bot User on Discord
Make a new bot user in the [Discord Developer Portal](https://discordapp.com/developers/applications) with the "New Application" button in the top right corner of the screen. Give the bot a name and click "Create". Once it finishes creating the bot user, click "Bot" along the left sidebar. Click on the link that says "Click to reveal token" as shown in the image and copy the resulting token; that will be used in the *botsettings.json* file (from this repository) on the server.

![botpage](https://user-images.githubusercontent.com/49416852/71217613-5c729380-228c-11ea-9fb3-fdba2ae27f40.png)

### Server Setup
To set up your own version of this bot, either clone or download this repository to a directory. Then, open a terminal window to install the Node.js and Node Package Manager (NPM) packages. Run these two commands:

```
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -`
sudo apt-get install -y nodejs npm
```

Enter your password and hit the Enter/Return key. Once Node.js and NPM are installed, go to the directory where you saved your copy of this repository and install the necessary packages in order to run the server. This command will install them for you:

`npm install async better-sqlite-pool common-tags discord.js enmap google-auth-library googleapis node-fetch request --save`

Once this completes, run `node index.js` in the root directory of the project.

### Deployment Addendum
There is a package called Process Manager 2 (PM2) that can restart the bot server in the event either the bot itself or the machine running the code goes down. To install, open a terminal and run `sudo npm install pm2 -g` and enter your password. After it completes, run `pm2 init`, which initializes the daemon, and `pm2 startup`, which creates a systemd script. The command will also give a command to setup the startup script; copy and paste that command into the terminal window.

Once that's done, you can start the bot server through PM2 rather than using the `node` command. To do this, use this command:
`pm2 start /path/to/project/index.js`. Lastly, run `pm2 save` to save the running process list; this will ensure the bot will automatically run when the server machine starts.
