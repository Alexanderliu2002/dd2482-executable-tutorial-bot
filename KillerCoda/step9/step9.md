# Setting up Github integrations

In this step we will integrate the bot with github using the github api. Firstly we will have to create a personal github token. This is done on the github page with the account that’s got access to the repository set up earlier in this tutorial. Copy the token and store it together with the owner of the repo and the name of repo in the .env file. We also need to send the url of the node.js application as a parameter in our api call. To open create a public url for our server we will be using ngrok. This requires an authetication key but we have provided you with one. Install ngrok and set it up using the following commands in a **new** terminal window:

```
cd node-slackbot
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list && sudo apt update && sudo apt install ngrok

ngrok authtoken 2nKze8cn1oeKBqGG0haTk60GQfF_36QbLqB1om4KPvb2gXjSc

ngrok http 4000
```

You should now see a url that has been crated for your server. Copy it and add it in the .env file with the suffix */webhook*

```
cd
cd node-slackbot
echo 'GITHUB_TOKEN = "Your token created on github"
OWNER = "owner of the repo with the actions"
REPO = "name of the repo with the actions"
SERVER_URL = "url to the node application with the suffix /webhook"' >> .env
' >> .env
```{{exec}}

(Don't forget to add your own variables!)

Next, in the **/src** folder create a folder called **/github-integrations**. In it create a file called **triggerAction.mjs** and add the following lines of code:

```
cd
cd node-slackbot/src
mkdir github-integrations
cd github-integrations
cat << 'EOF' > triggerAction.mjs
import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});
EOF
```{{exec}}

The first couple of lines import the necessary modules, the environment variables and create the octokit object used to interact with the github api. Next add the following lines to the file:

```
echo "
const owner = process.env.OWNER;
const repo = process.env.REPO;


export async function triggerAction(eventType) {
    try {
        await octokit.repos.createDispatchEvent({
            owner,
            repo,
            event_type: eventType,
            client_payload: {
                post_url: process.env.SERVER_URL,
            }
        });


        console.log('Triggered ' + eventType + ' action');
    } catch (error) {
        console.error(error);
    }
}
" >> triggerAction.mjs
```{{exec}}

These lines trigger a dispatch event in the github repo specified with a specific event_type. This type needs to be the one specified in the action and it is passed as a parameter to the function. It also sends the server url as payload for the action to know where to send the webhook in the final job (this will be handled in a later step).

In the uiActionHandlers.mjs file we need to call this function in order for the dispatch event to be triggered. This is done by modifying that file in the following way:

First import the function at the top of the file:
```
cd
cd node-slackbot/src/botUI
sed -i '1i\import { triggerAction } from "../github-integrations/triggerAction.mjs";' uiActionHandlers.mjs
```{{exec}} 

Modify the each action by adding the following line of code: 

```
sed -i "10i\            await triggerAction('event type');" uiActionHandlers.mjs
sed -i "25i\            await triggerAction('event type');" uiActionHandlers.mjs
```{{exec}} 

The event type needs to be the same as the ones each action listens to in the workflow. The file should now look like this:

```
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
```

Now if the bot is run and one of the buttons is clicked the corresponding action should be triggered in github. If this happens, well done! The incoming webhook isn’t handled which is the next step.

