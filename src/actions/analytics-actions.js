const ACTIONS = {
    SIGN_IN: "SIGN_IN",
    CLICK_CTA_BUTTON: "CLICK_CTA_BUTTON",
    VIEW_PAGE: "VIEW_PAGE",
    GROUP: "GROUP",
    ALIAS_USER: "ALIAS_USER"
}

const signIn = userId => dispatch => {
    dispatch({
        type: ACTIONS.SIGN_IN,
        analytics: {
            eventType: 'identify',
            eventPayload: {
                userId,
            },
        },
    });
};

const track = event => dispatch => {
    dispatch({
        type: ACTIONS.CLICK_CTA_BUTTON,
        analytics: {
            eventType: 'track',
            eventPayload: {
                event,
            },
        },
    });
};

const page = page => dispatch => {
    dispatch({
        type: ACTIONS.VIEW_PAGE,
        analytics: {
            eventType: 'page',
            eventPayload: {
                name: page,
            },
        },
    });
};

const group = groupId => dispatch => {
    dispatch({
        type: ACTIONS.GROUP,
        analytics: {
            eventType: 'group',
            eventPayload: {
                groupId,
            },
        },
    });
};

const alias = userId => dispatch => {
    dispatch({
        type: ACTIONS.ALIAS_USER,
        analytics: {
            eventType: 'alias',
            eventPayload: {
                userId,
            },
        },
    });
};

export default {
    signIn,
    track,
    page,
    group,
    alias,
}