# Setting up the webhook
In this step we will modify our code such that it listens to the incoming webhook from github. Add the following lines of code to the index.mjs file inbetween the creation of the *expressApp* object and the launch of the application:

```
expressApp.post('/webhook', async (req, res) => {
    console.log('Received a webhook event');
    const runId = req.body.run_id;


    res.send('Received a webhook event');
});
``` 
(click below)

```
sed -i "/expressApp.use(helmet());/a\
expressApp.post('/webhook', async (req, res) => {
    console.log('Received a webhook event');
    const runId = req.body.run_id;


    res.send('Received a webhook event');
});" index.mjs
``` {{exec}}

These lines listens for the webhook and posts a message if a message was sent to the url. The post sends the id of the actions run that we use in the next steps.

