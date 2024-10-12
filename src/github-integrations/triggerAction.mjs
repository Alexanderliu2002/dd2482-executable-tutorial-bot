import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.OWNER;
const repo = process.env.REPO;

export async function triggerAction(eventType) {
    try {
        await octokit.repos.createDispatchEvent({
            owner,
            repo,
            event_type: eventType,
        });

        console.log(`Triggered ${eventType} action`);
    } catch (error) {
        console.error(error);
    }
}
