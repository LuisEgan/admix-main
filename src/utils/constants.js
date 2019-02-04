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
  error: "Sorry there was an error, please try again later",
  noEmail: ["🤔 No email?", "🤷‍ We need an email!", "😵 Who are you?"],
  noPassword: [
    "🤔 Where's the password?",
    "🤷‍ We need a password!",
    "😵 Please enter a password",
  ],
  failedLogin: "Wrong username or password",
  userExists: "Sorry, that user already exists!",
  onlyLetters: "This can only contain letters!",
  onlyNumbers: "This can only contain numbers!",
};

const SUCCESS = {
  emailSent: "Success! Check your email for further instructions 😉",
  appUpdated: "App updated!",
  imgUpdate: "Profile pic updated!",
  userUpdate: "User updated!"
};

const COLORS = {
  [`light${APP_STATES.live}`]: "#E6F5FF",
  [`light${APP_STATES.inactive}`]: "#F5F7FA",
  [`light${APP_STATES.sandbox}`]: "#FFEBCC",
  [`light${APP_STATES.pending}`]: "#F5F7FA",
};

export default {
  ADMIX_OBJ_PREFIX,
  APP_STATES,
  APP_ENGINES_IMGS,
  LOGOS,
  ERRORS,
  SUCCESS,
  COLORS,
};
