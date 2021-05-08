const Discord = require('discord.js');
const config = require('./configs/config.json');
const fs = require('fs');
const path = require("path");
const fetch = require('node-fetch')

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

//ALL DATABASE FILES
// disablechatmodule enablechatmodule setchatbotchannel balance work setprefix warn 

const { Player } = require('discord-player');
const player = new Player(client);
client.player = player;
client.emotes = require('./configs/emotes.json')
client.filters = require('./configs/filters.json');
["aliases", "commands"].forEach(cmd => client[cmd] = new Discord.Collection());
["console", "command", "event"].forEach(events => require(`./handlers/${events}`)(client));
client.categories = fs.readdirSync('./commands');

//Initializing Database Firebase
const firebase = require('firebase/app')
const FieldValue = require('firebase-admin').firestore.FieldValue 
const admin = require('firebase-admin')

const serviceAccount = require('./configs/fire-db.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

let db = admin.firestore()

client.db = db;

// EVENTS
client.on('ready', async() => {
    console.log('|----------------ONLINE---------------|');
})

//Database Test Event

client.on('guildCreate', (guildData) => {
    db.collection('Guilds').doc(guildData.id).set({
        'GuildID': `${guildData.id}`,
        'Prefix': '>',
        'Chatbot_Channel': ``,
        'Chat_Module': false
    })
})

client.on(`message`, async (message) => {
    if(message.author.bot) return
    const { content } = message;
    const url = `http://api.brainshop.ai/get?bid=155546&key=di5p97DM66hv9YFl&uid=1&msg=${encodeURIComponent(content)}`
    db.collection(`Guild\'s Info`).doc(`${message.guild.id}`).get().then((q) => {
        if(q.exists){
            let id = q.data().Chatbot_Channel
            let check = q.data().Chat_Module
            if(id === message.channel.id){
                if(check === true){
                fetch(url)
                .then(res => res.json())
                .then(data => {
                  message.channel.send(data.cnt)
                })
            }else{
                return 
            }
            }else{
                return
            }
        }
    })
})

client.on('message', (message) => {
    let u = message.mentions.users.first();
    if(!u){
        return
    }
    if(u){
        if(u.id === '827421594745569290'){
            message.channel.send(`My Prefix is ${config.PREFIX}`)
        }
    }
})

client.login(config.TOKEN)