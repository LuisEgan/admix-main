import { Map } from 'immutable';

import { PERSIST_REHYDRATE } from 'actions/app';

const actionsMap = {
    [PERSIST_REHYDRATE]: (state, action) => {
        console.log("action ", action);
        return state.merge(Map({
            rehydrated: true
        }));
    }
}

export default (state = false , action = {}) => {
    const fn = actionsMap[action.type];
    return fn ? fn(state, action) : state;
};