
process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const token = '5067532401:AAEYWwTWEvNYBdUaMtVJaOLdrMJrKh4MfFY';

const bot = new TelegramBot(token);
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log(msg)

});

module.exports = bot