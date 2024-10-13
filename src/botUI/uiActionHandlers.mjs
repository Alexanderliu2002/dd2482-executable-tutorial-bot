import { triggerAction } from "../github-integrations/triggerAction.mjs";
import dotenv from 'dotenv';

dotenv.config();

export const registerActionHandlers = (app) => {
    app.action('deploy_master_action', async ({ ack, body, client }) => {
        try {
            await ack();
            await triggerAction('trigger-deploy');
            client.chat.postMessage({
                channel: process.env.SLACK_CHANNEL_ID,
                text: "Deploy event triggered"
            })
        }
        catch (error) {
            console.error(error);
        }
    });

    app.action('run_tests_action', async ({ ack, body, client }) => {
        try {
            await ack();
            await triggerAction('trigger-ci');
            client.chat.postMessage({
                channel: process.env.SLACK_CHANNEL_ID,
                text: "Deploy event triggered"
            })
        }
        catch (error) {
            console.error(error);
        }
    });
};