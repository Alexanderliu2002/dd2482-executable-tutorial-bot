import { Octokit } from "@octokit/rest";
import dotenv from 'dotenv';

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
