# Determine the causes of error
Our current implementation only parses if the jobs in the action were successful or not. The bot would give more insight if we were able to determine why a job failed or not. This is what will be implemented in this step. We will develop two ways of determining the cause of error - one that uses regular expressions in a way similar to the previous step and one that sends the log to OpenAIs api to parse the log using LLM’s. 

This requires us to add an OpenAI api key and a boolean value determining if we are to use the OpenAI API or not to our *.env* file such that it looks as follows:

```
SLACK_BOT_TOKEN = "The Slack OAuth token from step 1"
SLACK_SIGNING_SECRET = "The Slack sign in secret from step 1"
APP_TOKEN = "The Slack app token from step 1"
SLACK_PORT = 5000
EXPRESS_PORT = 4000
SLACK_CHANNEL_ID = "Slack channel id"
OPENAI_API_KEY = "Your OpenAI API key"
USE_GPT = "TRUE"
```

(Or use below command to append to file)
```
cd
cd node-slackbot
echo "
OPENAI_API_KEY = "Your OpenAI API key"
USE_GPT = "TRUE"
" >> .env
```

We also need to add the following lines to the top of the *logProcessor.mjs* file:

```
cd
cd node-slackbot/src/github-integrations
sed -i "2i\
import OpenAI from 'openai';\\
import dotenv from 'dotenv';\\
\\
\\
dotenv.config();\\
\\
\\
const configuration = new OpenAI({\\
    apiKey: process.env.OPENAI_API_KEY,\\
});" logProcessor.mjs
```{{exec}}

Next we need to modify our *parseJobLog* function such that it not only determines if the job was successful or not but also calles the corresponding function to find the cause of the error as follows: 

```
if (errorIndicators.test(logContent)) {
    status = 'failure';

    if(process.env.USE_GPT) {
        causes = await findErrorCauseGPT(jobName, logContent);
    }
    else {
        causes = findErrorCause(logContent);
    }
}
```

This function should also return the error cause if the job failed. This is done by adding the following lines before the return statement of the function:

```
if (status === 'failure') {
    return {
        jobName: jobName,
        status: status,
        jobNumber: parseInt(jobNumber),
        causes: causes,
    };
}
```

To determine the causes of the error we need to add the following functions to the **logProcessor.mjs** file:
* *findErrorCause*
* *extractErrorContext*
* *findErrorCauseGPT*

The function **findErrorCause** should have the following lines of code:
```
echo "
function findErrorCause(logContent) {
    const errorIndicators = [
        { regex: /FAIL\s.+/i, cause: 'Test Failure' },
        { regex: /✕\s.+/i, cause: 'Test Failure' },
        { regex: /●\s.+/i, cause: 'Test Failure' },
        { regex: /error\s/i, cause: 'Error' },
        { regex: /Process completed with exit code \d+/i, cause: 'Process Exit Error' },
        { regex: /assert.strictEqual\(.+\)/i, cause: 'Assertion Error' },
        { regex: /jest did not exit/i, cause: 'Jest Exit Issue' },
        { regex: /dependency issue/i, cause: 'Dependency Issue' },
    ];


    let causes = [];


    for (const indicator of errorIndicators) {
        const match = logContent.match(indicator.regex);
        if (match) {
            const contextLine = extractErrorContext(logContent, match.index);
            causes.push(`${indicator.cause}: ${contextLine}`);
        }
    }


    return causes.length > 0 ? causes : ['Unknown Error'];
}" >> logProcessor.mjs
```

It uses regular expressions to match possible errors with error indicators. These expressions are then searched for throughout the job log to find all possible error indicators. The function *extractErrorContext* compiles a string with the error indicator and the line of the log that the indicator was found on, removing date and time from the line. This line is later added to the entirety of the message sent to slack. The function is as follows:
```
echo "
function extractErrorContext(logContent, errorIndex) {
    const lines = logContent.split('\n');
    let contextLine = '';


    let charCount = 0;
    for (const line of lines) {
        charCount += line.length + 1;
        if (charCount > errorIndex) {
            contextLine = line.trim();
            break;
        }
    }


    return contextLine.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\s*/, '');
}" >> logProcessor.mjs
```

The other way to determine the cause is, as stated earlier, by using the OpenAI API. This function should look as follows:

```
async function findErrorCauseGPT(jobName, logContent) {
    const prompt = `You are an expert in analyzing software build logs.
    Please review the following log from a GitHub Actions job named "${jobName}" that has failed:
   
    ${logContent}
   
    Please provide a brief description of the causes of the failure. The description will be sent in a Slack message to the team.`;


    try {
        console.log('Sending prompt to OpenAI API');
       
        const response = await configuration.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: prompt,
                },
            ],
        });


        return [response.choices[0].message.content];
    }
    catch (error) {
        console.error(error);
        console.log('Error sending prompt to OpenAI API, using default error causes');
        return findErrorCause(logContent);
    }
}
```

This function uses a standard prompt, the name of the job, and the job log to instruct the LLM to find the error causes. The message received by the API is then retrieved and returned. If the API call were to fail the bot will use the manual way of determining the causes of error.

With these functions added the bot should trigger an action, send a message on slack telling if the action was successful or not, and in the case of failure parse the reason for failure and include it in the message.
