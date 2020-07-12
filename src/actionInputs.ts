import { actionInputs as inputs } from 'github-actions-utils';

export const actionInputs = {
    targetBranch: inputs.getString('targetBranch', true),
    pushForce: inputs.getBool('pushForce', true),
    gitUserEmail: inputs.getString('gitUserEmail', true),
    gitUserName: inputs.getString('gitUserName', true),
}