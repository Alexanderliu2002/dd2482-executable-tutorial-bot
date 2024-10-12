export const registerCommands = (app) => {
    app.command('/hi', async ({ command, ack, say }) => {
        try {
            await ack();
            await say(`Hello!`);
        }
        catch (error) {
            console.error(error);
        }
    });
}
