import * as ghActions from '@actions/core';
import { GitHub, context } from "@actions/github";
import { actionInputs } from './actionInputs';
import { getWorkspacePath } from "github-actions-utils";
import * as fs from "fs";
import simpleGit, {SimpleGit} from 'simple-git';

const WORKFLOWS_DIR = '.github/workflows';

// noinspection JSUnusedLocalSymbols
async function run(): Promise<void> {
    try {
        await runImpl();
    } catch (error) {
        ghActions.setFailed(error.message);
    }
}

async function runImpl() {
    if (process.env.GITHUB_TOKEN === undefined) {
        throw new Error('GITHUB_TOKEN env variable is not set');
    }
    if (process.env.GITHUB_ACTOR === undefined) {
        throw new Error('GITHUB_ACTOR env variable is not set');
    }
    if (process.env.GITHUB_REPOSITORY === undefined) {
        throw new Error('GITHUB_REPOSITORY env variable is not set');
    }
    if (process.env.DELAYED_JOB_WORKFLOW_FILE_PATH === undefined) {
        throw new Error('DELAYED_JOB_WORKFLOW_FILE_PATH env variable is not set');
    }
    if (process.env.DELAYED_JOB_CHECKOUT_REF_IS_TAG === undefined) {
        throw new Error('DELAYED_JOB_CHECKOUT_REF_IS_TAG env variable is not set');
    }
    if (process.env.DELAYED_JOB_CHECKOUT_REF_IS_TAG === 'true' &&
        process.env.DELAYED_JOB_CHECKOUT_REF === undefined
    ) {
        throw new Error('DELAYED_JOB_CHECKOUT_REF env variable is not set');
    }

    const workflowAbsFilePath = getWorkspacePath(process.env.DELAYED_JOB_WORKFLOW_FILE_PATH);

    if (!fs.existsSync(workflowAbsFilePath)) {
        throw new Error(`${process.env.DELAYED_JOB_WORKFLOW_FILE_PATH} file doesn't exist`);
    }

    if (process.env.DELAYED_JOB_CHECKOUT_REF_IS_TAG === 'true') {
        const {owner, repo} = context.repo;
        const github = new GitHub(process.env.GITHUB_TOKEN);
        ghActions.info(`GitHub: remove ${process.env.DELAYED_JOB_CHECKOUT_REF} tag...`);
        await github.git.deleteRef({owner, repo, ref: 'tags/' + process.env.DELAYED_JOB_CHECKOUT_REF})
    }

    const git = await getWorkspaceGit();
    ghActions.info(`Git: removing ${process.env.DELAYED_JOB_WORKFLOW_FILE_PATH}...`);
    await git.rm(process.env.DELAYED_JOB_WORKFLOW_FILE_PATH);

    ghActions.info(`Git: commit changes...`);
    await git.commit(`Scheduled job ${process.env.DELAYED_JOB_WORKFLOW_FILE_PATH} removed`);

    const remoteRepo = `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}` +
        `@github.com/${process.env.GITHUB_REPOSITORY}.git`;
    ghActions.info(`Git: push changes to ${actionInputs.targetBranch} branch...`);
    await git.push(remoteRepo, actionInputs.targetBranch, {
        'force': actionInputs.pushForce
    });
}

async function getWorkspaceGit(): Promise<SimpleGit> {
    const git = simpleGit(getWorkspacePath());
    await git.addConfig('user.email', actionInputs.gitUserEmail);
    await git.addConfig('user.name', actionInputs.gitUserName);
    return git;
}

// noinspection JSIgnoredPromiseFromCall
run();