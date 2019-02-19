import auth from "./auth";
import apps from "./apps";
import scenes from "./scenes";
import placements from "./placements";
import user from "./user";
import report from "./report";
import cloudinary from "./cloudinary";

const allActions = {
  ...auth,
  ...apps,
  ...scenes,
  ...placements,
  ...user,
  ...report,
  ...cloudinary,
};

export default allActions;
