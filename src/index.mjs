import pkg from '@slack/bolt';
import dotenv from 'dotenv';
import { registerCommands } from './commands.mjs';
import express from 'express';
import helmet from 'helmet';
import { getActionLog } from './github-integrations/getActionLog.mjs';

dotenv.config();

const { App } = pkg;

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.APP_TOKEN
});

registerCommands(app);

const expressApp = express();
expressApp.use(express.json());
expressApp.use(helmet());

expressApp.post('/webhook', async (req, res) => {
    console.log('Received a webhook event');
    const runId = req.body.run_id;

    res.send('Received a webhook event');

    try {
        const message = await getActionLog(runId);

        await app.client.chat.postMessage({
            channel: process.env.SLACK_CHANNEL_ID,
            text: message,
        });
    } catch (error) {
        console.error(error);
        console.log('Error sending message to Slack');
    }
});

(async () => {
    await app.start(process.env.SLACK_PORT);
    expressApp.listen(process.env.EXPRESS_PORT);
    console.log('Bot is running!');
})();
