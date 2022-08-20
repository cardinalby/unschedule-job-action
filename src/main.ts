import * as ghActions from '@actions/core';
import { GitHub, context } from "@actions/github";
import { actionInputs } from './actionInputs';
import {octokitHandle404} from "./octokitHandle404";
import { Octokit } from '@octokit/rest';
import {consts} from "./consts";
import { actionOutputs } from './actionOutputs';

// noinspection JSUnusedLocalSymbols
async function run(): Promise<void> {
    try {
        await runImpl();
    } catch (error) {
        ghActions.setFailed(String(error));
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

    ghActions.info(
        `GitHub: removing ${process.env.DELAYED_JOB_WORKFLOW_FILE_PATH} at ` +
        `${process.env.DELAYED_JOB_WORKFLOW_UNSCHEDULE_TARGET_BRANCH} branch...`
    );
    const deleteResponse = await github.repos.deleteFile({owner, repo,
        path: process.env.DELAYED_JOB_WORKFLOW_FILE_PATH,
        sha: (existingFileResponse.data as Octokit.ReposGetContentsResponseItem).sha,
        branch: process.env.DELAYED_JOB_WORKFLOW_UNSCHEDULE_TARGET_BRANCH,
        message: `Remove ${process.env.DELAYED_JOB_WORKFLOW_FILE_PATH} delayed job`,
        author: {
            email: consts.gitAuthorEmail,
            name: consts.gitAuthorName
        },
    });
    actionOutputs.commitSha.setValue(deleteResponse.data.commit.sha);

    if (process.env.DELAYED_JOB_CHECKOUT_REF_IS_TAG === 'true' && actionInputs.deleteRefTag) {
        ghActions.info(`GitHub: Remove ${process.env.DELAYED_JOB_CHECKOUT_REF} tag...`);
        await github.git.deleteRef({owner, repo, ref: 'tags/' + process.env.DELAYED_JOB_CHECKOUT_REF})
    }
}

// noinspection JSIgnoredPromiseFromCall
run();
