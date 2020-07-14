import { actionInputs as inputs } from 'github-actions-utils';

export const actionInputs = {
    ghToken: inputs.getString('ghToken', true, true)
}