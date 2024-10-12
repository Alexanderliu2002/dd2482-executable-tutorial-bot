import { triggerAction } from "../github-integrations/triggerAction.mjs";

export const registerActionHandlers = (app) => {
    app.action('deploy_master_action', async ({ ack, body, client }) => {
        try {
            await ack();
            await triggerAction('trigger-deploy');
            client.chat.postMessage({
                channel: body.user.id,
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
                channel: body.user.id,
                text: "Deploy event triggered"
            })
        }
        catch (error) {
            console.error(error);
        }
    });
};