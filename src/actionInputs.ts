import { actionInputs as inputs, transformIfSet } from 'github-actions-utils';

export const actionInputs = {
    ghToken: inputs.getString('ghToken', true, true),
    deleteRefTag: inputs.getBool('deleteRefTag', false)
}