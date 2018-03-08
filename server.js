const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', () => {
    console.log(`System connected: ${client.user.tag}`)
});

client.on('message', (msg) => {
    
});

// Note: discord.js provides us no mechanism with which to catch the failed
// login. However, the bot will terminate with a meaningful error, so we'll
// just take that for now.
const token = client.login(process.env.npm_package_config_token)
