import JSZip from "jszip";
import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config();

const configuration = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function processLogs(codedLogs) {
    const zip = await JSZip.loadAsync(codedLogs);

    const files = zip.files;

    const unpackedFiles = {};

    const jobLogs = [];

    for (const [filename, file] of Object.entries(files)) {
        if (!file.dir) {
            const content = await file.async('string');
            unpackedFiles[filename] = content;
            jobLogs.push(await parseJobLog(filename, content));
        }
    }

    jobLogs.sort((a, b) => {
        return parseInt(a.jobNumber) - parseInt(b.jobNumber);
    });
    
    let message = '';

    message += `The workflow "${jobLogs[0].jobName}" was run with status ${jobLogs[0].status}. Here is an overview of the individual jobs:\n`;

    const cleanJobLogs = jobLogs.slice(1);

    for (const job of cleanJobLogs) {
        if (job) {
            message += `Job: ${job.jobName} - ${job.status}\n`;
            if (job.status === 'failure') {
                message += `Causes:\n    ${job.causes.join(',\n    ')}\n`;
            }
        }
    }

    message = message.slice(0, -1);

    return message;
}

async function parseJobLog(fileName, logContent) {
    const jobNumberMatch = fileName.match(/(?:.*\/)?(-?\d+)_/);
    const jobNumber = jobNumberMatch ? jobNumberMatch[1] : null;

    const jobNameMatch = fileName.match(/(?:.*\/)?\d+_(.+)\.txt$/);
    const jobName = jobNameMatch ? jobNameMatch[1] : null;
    let status = 'success';

    const errorIndicators = /(?<!continue on )error|fail/i;

    let causes = [];

    if (errorIndicators.test(logContent)) {
        status = 'failure';

        if(process.env.USE_GPT) {
            causes = await findErrorCauseGPT(jobName, logContent);
        }
        else {
            causes = findErrorCause(logContent);
        }
    }

    if(parseInt(jobNumber) < 0) {
        return;
    }

    if (status === 'failure') {
        return {
            jobName: jobName,
            status: status,
            jobNumber: parseInt(jobNumber),
            causes: causes,
        };
    }

    return {
        jobName: jobName,
        status: status,
        jobNumber: parseInt(jobNumber),
    };
}

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
}

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
}

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