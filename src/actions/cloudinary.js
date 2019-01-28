import api from "../api";
import { setAsyncError } from "./asyncActions";
import { SET_USER_IMG_URL, USER_IMG_UPLOAD } from "./actions";
import user from "./user";

const { getUserData } = user;

const setUserImgURL = data => ({
  type: SET_USER_IMG_URL,
  data,
});

const imgUploadRes = data => ({
  type: USER_IMG_UPLOAD,
  data,
});

// * FETCH

const imgUpload = (imgPath, userId, accessToken) => dispatch => {
  const data = {
    imgPath,
    userId,
  };

  api
    .cloudinayImgUpload(accessToken, data)
    .then(data => {
      dispatch(imgUploadRes(data));

      // update userData.cloudinaryURL from db
      dispatch(getUserData(accessToken));
    })
    .catch(error => {
      dispatch(setAsyncError(error));
    });
};

const fetchUserImgURL = (imgURL, accessToken) => dispatch => {
  dispatch(setUserImgURL(imgURL));
};

export default {
  setUserImgURL,
  imgUpload,
  fetchUserImgURL,
};
