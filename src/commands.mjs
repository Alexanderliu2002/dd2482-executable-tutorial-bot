import botUI from './botUI/botUI.json' assert { type: 'json' };
import { registerActionHandlers } from './botUI/uiActionHandlers.mjs';

export const registerCommands = (app) => {
    app.command('/hi', async ({ command, ack, say }) => {
        try {
            await ack();
            await say(`Hello <@${command.user_id}>!`);
        }
        catch (error) {
            console.error(error);
        }
    });

    app.command('/thx1138', async ({ command, ack, say }) => {
        try {
            await ack();
            await say(`The force is strong with this one.`);
        }
        catch (error) {
            console.error(error);
        }
    });

    app.command('/github', async ({ command, ack, client }) => {
        try {
            await ack();
            await client.views.open({
                trigger_id: command.trigger_id,
                view: botUI
            });
        }
        catch (error) {
            console.error(error);
        }
    });

    registerActionHandlers(app);
}
