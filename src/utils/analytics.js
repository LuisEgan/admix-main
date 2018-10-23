import KEYS from "../config/keys"
import routeCodes from "../config/routeCodes";

// everywhere except on port 3001
// let applyAnalytics = window.analytics ? process.env.NODE_ENV === "production" ? window.origin.indexOf("3001") < 0 : true : false;

// only on prod and on port 3001
let applyAnalytics;
if(window.origin) {
    applyAnalytics = window.analytics && (process.env.NODE_ENV === "production" || window.origin.indexOf("3001") >= 0);
} else {
    applyAnalytics = window.analytics && (process.env.NODE_ENV === "production" || window.location.origin.indexOf("3001") >= 0);
}

const load = () => {
    if (applyAnalytics) {
        window.analytics.load(KEYS.SEGMENT_WRITE_KEY)
    };
}

const page = (category, name, properties, options, cb) => {
    applyAnalytics && window.analytics.page(category, name, properties, options, cb);
}

const track = (event, properties, options, cb) => {
    applyAnalytics && window.analytics.track(event, properties, options, cb);
}

const identify = (userId, traits, options, cb) => {
    if (applyAnalytics) {
        userId ? window.analytics.identify(userId, traits, options, cb) : window.analytics.identify(traits, options, cb);
    }
}


// FOR GOOGLE ANALYTICS
const ga = {
    categories: {
        account: "account",
        apps: "apps",
        scenes: "scenes",
        placements: "placements",
        download: "download",
        navigationLinks: "navigation links",
        report: "report"
    },
    actions: {
        account: {
            registerFailed: "register failed",
            loginClick: "login click",
            failedLogin: "failed login",
            login: "log in",
            logout: "log out",
            emailChangeRequest: "email change request",
            passwordChangeRequest: "password change request",
            emailChange: "email change",
            passwordChange: "password change",
            imageChange: "image change",
            accountUpdate: "account update"
        },
        apps: {
            modifyStoreUrl: "modify store url",
            toggleAppState: "toggle app state",
            openFilter: "open filter",
            addFilter: "add filter",
            deleteFilter: "delete filter",
            selectApp: "select app",
            selectAllApps: "select all apps",
            unselectApp: "unselect app",
            unselectAllApps: "unselect all apps"
        },
        scenes: {
            toggleSceneDisplayMode: "toggle scene display mode",
            toggleControlsView: "toggle controls view",
        },
        placements: {
            togglePlacementState: "toggle placement state",
            changeCategory: "change category",
            changeSubCategory: "change subcategory"
        },
        download: {
            unity: "unity",
            unreal: "unreal",
            guide: "guide"
        },
        navigationLinks: {
            toReport: "to report",
            toGlobalReport: "to global report",
            breadcrumb: "breadcrumb",
            toDownloadNoApps: "to download with no apps"
        },
        report: {
            changeReportDate: "change report date",
            changeReportDisplay: "change report display",
            selectApp: "select app to report",
            selectAllApps: "select all apps to report",
            unselectApp: "unselect app to report",
            unselectAllApps: "unselect all apps to report",
            changePerformanceGraphData: "change performance graph data"
        }
    },
    labels: {
        failedLogin: {
            wrongPassword: "wrong password",
            wrongUsername: "wrong username",
            wrongEither: "wrong username or password"
        },
        passwordChangeRequest: {
            onLogin: "password change request on login",
            onProfile: "password change request on profile"
        },
        toggleAppState: {
            onMyapps: "toggle app state on myapps",
            onScene: "toggle app state on scene"
        },
        toggleSceneDisplayMode: {
            raw: "toggle to raw",
            d3: "toggle to 3d"
        },
        toggleControlsView: {
            show: "show controls",
            hide: "hide controls"
        },
        togglePlacementState: {
            onRaw: "toggle placement state on raw",
            on3d: "toggle placement state on 3d"
        },
        changeCategory: {
            onRaw: "change category state on raw",
            on3d: "change category state on 3d"
        },
        changeSubCategory: {
            onRaw: "change subcategory state on raw",
            on3d: "change subcategory state on 3d"
        },
        breadcrumb: {
            [routeCodes.MYAPPS]: "breadcrumb to myapps",
            [routeCodes.SCENE]: "breadcrumb to scene"
        },
        changeReportDate: {
            t: "change report to today",
            y: "change report to yesterday",
            l: "change report to last week",
            a: "change report to all",
            c: "change report to custom",
        },
        changeReportDisplay: {
            ov: "change report display to overview",
            pe: "change report display to performance",
        },
        changePerformanceGraphData: {
            revenue: "performance revenue",
            impressions: "performance impression",
            RPM: "performance rpm",
            fillRate: "performance fill rate",
        }
    }
}

// FOR SEGMENT
const events = {
    button: {
        clicked: "clicked",
    },
    account: {
        created: "created",
        createdFailed: "created failed",
        verified: "verified",
        loggedIn: "logged In",
        loggedOut: "logged Out",
        failedLogin: "failed Login",
        emailChangedRequested: "email change requested",
        passwordChangeRequested: "password change requested",
        emailChanged: "email changed",
        passwordChanged: "password changed",
        imageChanged: "image changed",
        updated: "account updated"
    },
    apps: {
        addedStoreURL: "modified store url",
        toggledAppState: "toggled app state",
    },
    scenes: {

    },
    placements: {
        toggledPlacementState: "toggled placement state",
        changedCategory: "changed category",
        changedSubcategory: "changed subcategory",
    }
}

const buttonsActions = {
    toggleAppStatus: "toggle app status",

    redirectTo: {
        [routeCodes.LOGIN]: "redirect to " + routeCodes.LOGIN,
        [routeCodes.MYAPPS]: "redirect to " + routeCodes.MYAPPS,
        [routeCodes.DOWNLOAD]: "redirect to " + routeCodes.DOWNLOAD,
        [routeCodes.SCENE]: "redirect to " + routeCodes.SCENE,
        [routeCodes.INFO]: "redirect to " + routeCodes.INFO,
        [routeCodes.PROFILE]: "redirect to " + routeCodes.PROFILE,
        [routeCodes.REPORT]: "redirect to " + routeCodes.REPORT,
        [routeCodes.REPORT + "G"]: "redirect to " + routeCodes.REPORT + " (Global)",
    },

    // LOGIN
    login: "login",
    register: "register",
    forgotPassword: "forgot password",

    // MYAPPS
    openFilter: "open filter",
    addFilter: "add filter",
    deleteFilter: "delete filter",

    // SCENE
    displayMode3d: "display mode 3d",
    displayModeRaw: "display mode raw",
    changeRawDataRows: "change raw data rows",
    hideControls: "hide controls",
    showControls: "show controls",

    // REPORT
    selectApp: "select app",
    selectAllApps: "select all apps",
    unselectApp: "unselect app",
    unselectAllApps: "unselect all apps",
    changeDateTo: {
        t: "change date to today",
        y: "change date to yesterday",
        l: "change date to last week",
        a: "change date to all",
        custom: "change date to custom",
    },
    reportDisplay: {
        ov: "display overview",
        pe: "display performance",
    },
    changePerformanceGraphTo: {
        revenue: "change performance graph to revenue",
        impressions: "change performance graph to impression",
        RPM: "change performance graph to rpm",
        fillRate: "change performance graph to fill rate",
    },

    // DOWNLOAD
    download: {
        unity: "download unity plugin",
        unreal: "download unreal plugin",
        guide: "download guide",
    }
}

const buttonsLocations = {
    breadcrumb: "breadcrumb",
    headerMenu: "header menu",
    sideMenu: "side menu",
    mainPanel: "main panel",
    menuPanel: "menu panel",
    formPanel: "form panel",
    loginPanel: "login panel"
}

export default {
    load,
    page,
    track,
    identify,
    ga,
    events,
    buttonsActions,
    buttonsLocations
}