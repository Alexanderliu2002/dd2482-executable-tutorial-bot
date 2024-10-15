# Parsing Github logs
We now have the logs but they are coded into zip files, one file per job. The parsing of these logs requires us to unzip these ones into objects and figuring out if each job was successful or failed. This is done through two functions, one that processes all log files and one that determines the success of the jobs individually. Firstly create a new file in the **/github-integrations** folder called logProcessor.mjs, and in it create a function called *processLogs* with the following code:

```
cd
cd node-slackbot/src/github-integrations
cat << 'EOF' > logProcessor.mjs
import JSZip from "jszip";


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
};
EOF
```{{exec}}

This function decodes all files and processes the job logs individually, determining if the jobs were successful or not. After that it sorts the job logs based on the job number since the logs aren’t parsed in order of execution on github. Lastly it compiles a message that is returned.

The function that process each job log is called *parseJobLog* and should look as follows:

```
echo "
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
" >> logProcessor.mjs
```{{exec}}

This function uses regular expressions to determine if the word error or fail occurs in the log. If the job was successful these words should not exist (except for the case continue on error which is neglected by the expression). It returns an object containing the jobName, jobNumber, and if it succeeded or not.