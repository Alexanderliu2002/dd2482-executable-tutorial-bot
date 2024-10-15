# Setup action handlers
This step will set up the action handlers for the UI. One of the steps in the action handler will be to send messages to a channel on slack. In order for this to be possible we need to export the id of the channel we want the bot to send messages in. This is done in the slack workspace by navigating to the channel, clicking the three dots in the corner and clicking the button *Open channel details*.

<img src="../assets/slackaction_8.1.png">

In the modal that opened scroll to the bottom where you find the channel id. 

<img src="../assets/slackaction_8.2.png">

Copy it and store it it in the .env file:

```
cd
cd node-slackbot
echo "SLACK_CHANNEL_ID = "Your Slack channel id"
" >> index.mjs
```{{exec}}

Next, in the top of the command.mjs file, under the import of the botUI add the following lines of code:

```
import { registerActionHandlers } from './botUI/uiActionHandlers.mjs';
```

(if you are lazy click below)

```
cd
cd cd node-slackbot/src
sed -i "2i\import { registerActionHandlers } from './botUI/uiActionHandlers.mjs';" commands.mjs
```{{exec}}

In the function registerCommands add the following line of code:

```
registerActionHandlers(app);
```
