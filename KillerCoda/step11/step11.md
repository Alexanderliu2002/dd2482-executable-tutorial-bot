# Download logs from github
In this step we will get the logs of the job from github. This is also done through the octokit library and the first step is to create a new folder in /src called /github-integrations. In it create the following file called getActionLog.mjs with the first lines being:

```
cd
cd node-slackbot/src/github-integrations
cat << 'EOF' > getActionLog.mjs
import { Octokit } from "@octokit/rest";
import dotenv from 'dotenv';


dotenv.config();


const owner = process.env.OWNER;
const repo = process.env.REPO;


const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});
EOF
```{{exec}}

This file will contain two functions, one that checks if the actions have finished running and one that gets the logs. This, because the final job in the action is to send the post request, however this reaches the bot before the entire action has finished. Github compiles the log files after an action has completed its run which leads to a timing problem. This function is called **waitForRunToComplete** and should look like this:

```
echo "
async function waitForRunToComplete(runId) {
    let status;
    let logsFetched = false;
    while (logsFetched === false) {
        const response = await octokit.actions.getWorkflowRun({
            owner,
            repo,
            run_id: runId,
        });
        status = response.data.status;


        if (status === 'completed') {
            logsFetched = true;
        }


        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}
" >> getActionLog.mjs
```{{exec}}

We check if the actions run with a specific id is completed, if so we break the loop and the function returns, otherwise the function waits for 5 seconds and checks again.

Next we need to get the logs from github. This function is called **getActionLog** and should look like this:
```
echo "
export async function getActionLog(runId) {
    try {
        await waitForRunToComplete(runId);


        const response = await octokit.actions.downloadWorkflowRunLogs({
            owner,
            repo,
            run_id: runId,
        });


        return response.data;
       
    } catch (error) {
        console.error(error);
        return "";
    }
}
" >> getActionLog.mjs
```{{exec}}

We call **waitForRunToComplete** and if it returns we get the action logs using the id of the actions run.

Finally we call **getActionLog** from the webhook receiver in index.mjs my modifying it with the following code:

``` 
sed -i "/res.send('Received a webhook event');/a\
try {
        const codedLogs = await getActionLog(runId);
        console.log('Sending message to Slack');
    } catch (error) {
        console.error(error);
        console.log('Error sending message to Slack');
    }" index.mjs
```