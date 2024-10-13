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

    for (const [filename, file] of Object.entries(files)) {
        if (!file.dir) {
            const content = await file.async('string');
            unpackedFiles[filename] = content;
            console.log(`File ${filename} has been extracted`);
            console.log(content);
        }
    }
}

export async function getActionLog(runId) {
    try {
        await waitForRunToComplete(runId);

        const response = await octokit.actions.downloadWorkflowRunLogs({
            owner,
            repo,
            run_id: runId,
        });

        await processLogs(response.data);
        
    } catch (error) {
        console.error(error);
    }
}
