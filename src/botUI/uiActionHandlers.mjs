export const registerActionHandlers = (app) => {
    app.action('deploy_master_action', async ({ ack, body, client }) => {
        try {
            await ack();
            console.log("Deploying master branch...");
        }
        catch (error) {
            console.error(error);
        }
    });

    app.action('run_tests_action', async ({ ack, body, client }) => {
        try {
            await ack();
            console.log("Running tests...");
        }
        catch (error) {
            console.error(error);
        }
    });

    app.action('redeploy_action', async ({ ack, body, client }) => {
        try {
            await ack();
            console.log("Redeploying...");
        }
        catch (error) {
            console.error(error);
        }
    });
};