import * as ghActions from '@actions/core';
import { GitHub, context } from "@actions/github";
import { actionInputs } from './actionInputs';
import {octokitHandle404} from "./octokitHandle404";
import { Octokit } from '@octokit/rest';
import {consts} from "./consts";

// noinspection JSUnusedLocalSymbols
async function run(): Promise<void> {
    try {
        await runImpl();
    } catch (error) {
        ghActions.setFailed(error.message);
    }
}

async function runImpl() {
    if (process.env.GITHUB_ACTOR === undefined) {
        throw new Error('GITHUB_ACTOR env variable is not set');
    }
    if (process.env.DELAYED_JOB_WORKFLOW_FILE_PATH === undefined) {
        throw new Error('DELAYED_JOB_WORKFLOW_FILE_PATH env variable is not set');
    }
    if (process.env.DELAYED_JOB_CHECKOUT_REF_IS_TAG === undefined) {
        throw new Error('DELAYED_JOB_CHECKOUT_REF_IS_TAG env variable is not set');
    }
    if (process.env.DELAYED_JOB_CHECKOUT_REF === undefined) {
        throw new Error('DELAYED_JOB_CHECKOUT_REF env variable is not set');
    }
    if (process.env.DELAYED_JOB_WORKFLOW_UNSCHEDULE_TARGET_BRANCH === undefined) {
        throw new Error('DELAYED_JOB_WORKFLOW_UNSCHEDULE_TARGET_BRANCH env variable is not set');
    }

    const {owner, repo} = context.repo;
    const github = new GitHub(actionInputs.ghToken);

    const targetBranchRef = 'heads/' + process.env.DELAYED_JOB_WORKFLOW_UNSCHEDULE_TARGET_BRANCH;
    ghActions.info(
        `GitHub: Check if ${process.env.DELAYED_JOB_WORKFLOW_FILE_PATH} file already exists ` +
        `at ref ${targetBranchRef}...`
    );
    const existingFileResponse = await octokitHandle404(
        github.repos.getContents,
        { owner, repo, path: process.env.DELAYED_JOB_WORKFLOW_FILE_PATH, ref: targetBranchRef }
    );
    if (existingFileResponse === undefined) {
        throw new Error(`${process.env.DELAYED_JOB_WORKFLOW_FILE_PATH} file not found`);
    }

    if (process.env.DELAYED_JOB_CHECKOUT_REF_IS_TAG === 'true') {
        ghActions.info(`GitHub: Remove ${process.env.DELAYED_JOB_CHECKOUT_REF} tag...`);
        await github.git.deleteRef({owner, repo, ref: 'tags/' + process.env.DELAYED_JOB_CHECKOUT_REF})
    }

    ghActions.info(
        `GitHub: removing ${process.env.DELAYED_JOB_WORKFLOW_FILE_PATH} at ` +
        `${process.env.DELAYED_JOB_WORKFLOW_UNSCHEDULE_TARGET_BRANCH} branch...`
    );
    await github.repos.deleteFile({owner, repo,
        path: process.env.DELAYED_JOB_WORKFLOW_FILE_PATH,
        sha: (existingFileResponse.data as Octokit.ReposGetContentsResponseItem).sha,
        branch: process.env.DELAYED_JOB_WORKFLOW_UNSCHEDULE_TARGET_BRANCH,
        message: `Remove ${process.env.DELAYED_JOB_WORKFLOW_FILE_PATH} delayed job`,
        author: {
            email: consts.gitAuthorEmail,
            name: consts.gitAuthorName
        },
    })
}

// noinspection JSIgnoredPromiseFromCall
run();