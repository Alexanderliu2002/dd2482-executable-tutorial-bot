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
}
