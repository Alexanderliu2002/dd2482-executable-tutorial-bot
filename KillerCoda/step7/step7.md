# Setting up the GUI

For simplicity we want to be able to interact with our bot using a graphical interface with predefined functions. These will trigger our events in github actions setup earlier. The first step is to create the UI itself, the action to launch the UI and the specific actions triggered by the button clicks in the UI.

The UI will be launched by the slash command */github* in the bot. Set this one up on the slack API platform in the same way as the earlier step. Once this is done add the following lines of code in the commands.mjs file:
In the top of the file add

```
import botUI from './botUI/botUI.json' assert { type: 'json' };
```
(if you are lazy click below)

```
cd
cd node-slackbot/src
sed -i "1i\import botUI from './botUI/botUI.json' assert { type: 'json' };" commands.mjs
```{{exec}}

These lines import modules from to files we will create shortly. In the function registerCommands add the following command actions:

```
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
``` 

This function opens a modal called **botUI** instead of sending a message like the last slash command we created.

Next create a folder in the **/src** path called **/botUI** and in it create the file **botUI.json**. 
The file **botUI.json** will store the configuration for our UI, created using Slack Block Kit. Use the following lines of code to fill in the json-config:

```
cd
cd node-slackbot
mkdir botUI
cd botUI
cat << 'EOF' > botUI.json
{
    "type": "modal",
    "callback_id": "modal-identifier",
    "title": {
      "type": "plain_text",
      "text": "Deployment Actions"
    },
    "blocks": [
      {
        "type": "section",
        "block_id": "section-1",
        "text": {
          "type": "mrkdwn",
          "text": "*Choose an action:*"
        }
      },
      {
        "type": "actions",
        "block_id": "actionblock-1",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Deploy Master"
            },
            "value": "deploy_master",
            "action_id": "deploy_master_action"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Run Tests"
            },
            "value": "run_tests",
            "action_id": "run_tests_action"
          }
        ]
      }
    ],
    "close": {
      "type": "plain_text",
      "text": "Close"
    }
EOF
```{{exec}}

This modal has a short line of text prompting the user to select an action by clicking the corresponding button and two buttons (one for each setup github action), each with a unique action_id:
- deploy_master_action
- run_tests_action

These id’s are what will trigger the corresponding lines of code for each action. For now if you in slack write */github* and press enter the modal with the prompt and the two buttons should appear. The next step is to add the action handlers for these buttons.
