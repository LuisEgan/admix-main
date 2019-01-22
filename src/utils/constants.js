import React from "react";
import ReactSVG from "react-svg";

import Unity from "../assets/img/unity-logo_20.png";
import Unreal from "../assets/img/Unreal-Engine-Logo_60x60.png";
import HiFi from "../assets/svg/hifi.svg";
import Desktop from "../assets/img/unity-logo_20.png";
import admix from "../assets/img/isologo.png";
import sbvrSVG from "../assets/svg/SBVR.svg";

import SVG from "../components/SVG";

const ADMIX_OBJ_PREFIX = "__advirObj__";

const APP_STATES = {
  live: "live",
  inactive: "inactive",
  sandbox: "sandbox",
  pending: "pending",
  deleted: "deleted",
};

const APP_ENGINES_IMGS = {
  Unity,
  Unreal,
  "High Fidelity": HiFi,
  Desktop,
  SBVR: <ReactSVG src={sbvrSVG} className="logo-SBVR" />,
};

const LOGOS = {
  Admix: <img src={admix} alt="admix" />,
  SBVR: <ReactSVG src={sbvrSVG} className="logo-SBVR" />,
  Unity: SVG.logoUnity,
  Unreal: SVG.logoUnreal,
  "High Fidelity": <img src={HiFi} alt="hifi" />,
  Paypal: SVG.logoPaypal,
};

const ERRORS = {
  noEmail: ["🤔 No email?", "🤷‍ We need an email!", "😵 Who are you?"],
  noPassword: ["🤔 Where's the password?", "🤷‍ We need a password!", "😵 Please enter a password"],
  failedLogin: "Wrong username or password"
};

export default {
  ADMIX_OBJ_PREFIX,
  APP_STATES,
  APP_ENGINES_IMGS,
  LOGOS,
  ERRORS,
};
