import { Octokit } from "@octokit/rest";
import dotenv from 'dotenv';
import JSZip from "jszip";

dotenv.config();

const owner = process.env.OWNER;
const repo = process.env.REPO;

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

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

async function processLogs(codedLogs) {
    const zip = await JSZip.loadAsync(codedLogs);

    const files = zip.files;

    const unpackedFiles = {};

    const jobLogs = [];

    for (const [filename, file] of Object.entries(files)) {
        if (!file.dir) {
            const content = await file.async('string');
            unpackedFiles[filename] = content;
            jobLogs.push(parseJobLog(filename, content));
        }
    }

    jobLogs.sort((a, b) => {
        return parseInt(a.jobNumber) - parseInt(b.jobNumber); // Ascending order
    });
    
    let message = '';

    message += `The workflow "${jobLogs[0].jobName}" was run with status ${jobLogs[0].status}. Here are the individual jobs:\n`;

    const cleanJobLogs = jobLogs.slice(1);

    for (const job of cleanJobLogs) {
        if (job) {
            message += `Job: ${job.jobName} - ${job.status}\n`;
        }
    }

    message = message.slice(0, -1);

    return message;
}

function parseJobLog(fileName, logContent) {
    const jobNumberMatch = fileName.match(/(?:.*\/)?(-?\d+)_/);
    const jobNumber = jobNumberMatch ? jobNumberMatch[1] : null;

    const jobNameMatch = fileName.match(/(?:.*\/)?\d+_(.+)\.txt$/);
    const jobName = jobNameMatch ? jobNameMatch[1] : null;
    let status = 'success';

    const errorIndicators = /(?<!continue on )error|fail/i;

    if (errorIndicators.test(logContent)) {
        status = 'failure';
    }

    if(parseInt(jobNumber) < 0) {
        return;
    }

    return {
        jobName: jobName,
        status: status,
        jobNumber: parseInt(jobNumber),
    };
}

export async function getActionLog(runId) {
    try {
        await waitForRunToComplete(runId);

        const response = await octokit.actions.downloadWorkflowRunLogs({
            owner,
            repo,
            run_id: runId,
        });

        const message = await processLogs(response.data);

        return message;
        
    } catch (error) {
        console.error(error);
        return "";
    }
}
