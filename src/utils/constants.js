import Unity from "../assets/img/unity-logo_20.png";
import Unreal from "../assets/img/Unreal-Engine-Logo_60x60.png";
import HiFi from "../assets/svg/hifi.svg";
import Desktop from "../assets/img/unity-logo_20.png";
// import Android from "../assets/img/android.png";
// import WindowsEditor from "../assets/img/Thinking_Face_Emoji.png";

import SVG from "../components/SVG";

// export const ADMIX_OBJ_PREFIX = "__admixObj__";
const ADMIX_OBJ_PREFIX = "__advirObj__";

const APP_STATES = {
    live: "live",
    inactive: "inactive",
    pending: "pending"
}

const APP_ENGINES_IMGS = {
    Unity,
    Unreal,
    "High Fidelity": HiFi,
    Desktop,
    // WindowsEditor,
    // Android
}

const LOGOS = {
    Unity: SVG.logoUnity,
    Unreal: SVG.logoUnreal,
    Paypal: SVG.logoPaypal
}

export default {
    ADMIX_OBJ_PREFIX,
    APP_STATES,
    APP_ENGINES_IMGS,
    LOGOS
}