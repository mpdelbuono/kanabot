const Discord = require('discord.js')
const client = new Discord.Client()
const CommandResolverStrategy = require('./CommandResolverStrategy.js');
const AlwaysNotifyStrategy = require('./AlwaysNotifyStrategy.js');
const strategies = [];

// Set up the list of strategies
strategies.push(new AlwaysNotifyStrategy());
strategies.push(new CommandResolverStrategy());

// Register each command into the strategies
{
    var commands = require('./commands');
    strategies.forEach((strategy) => {
        commands.forEach((command) => {
            strategy.register(command);
        });
    });
}

client.on('ready', () => {
    console.log(`System connected: ${client.user.tag}`)
});

client.on('message', (msg) => {
    strategies.forEach((strategy) => strategy.notify(msg))
});

// Note: discord.js provides us no mechanism with which to catch the failed
// login. However, the bot will terminate with a meaningful error, so we'll
// just take that for now.
const token = client.login(process.env.npm_package_config_token)
