import pkg from '@slack/bolt';
import dotenv from 'dotenv';
import { registerCommands } from './commands.mjs';

dotenv.config();

const { App } = pkg;

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.APP_TOKEN
});

registerCommands(app);

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('Github Slack bot is running!');
})();
