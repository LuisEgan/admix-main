import api from "../api";
import {
  setAsyncError,
  setAsyncLoading,
  setAsyncMessage,
} from "./asyncActions";
import { SET_USER_IMG_URL, USER_IMG_UPLOAD } from "./actions";
import user from "./user";
import C from "../utils/constants";

const { getUserData } = user;

const setUserImgURL = data => ({
  type: SET_USER_IMG_URL,
  data,
});

const fetchUserImgURL = imgURL => dispatch => {
  dispatch({
    type: SET_USER_IMG_URL,
    data: imgURL,
  });
};

// * FETCH

const imgUpload = (imgPath, userId, accessToken) => async dispatch => {
  dispatch(setAsyncLoading(true));
  const data = {
    imgPath,
    userId,
  };

  try {
    const res = await api.cloudinayImgUpload(accessToken, data);
    if (!res.status) throw res.message;

    dispatch({
      type: USER_IMG_UPLOAD,
      data: res,
    });
    dispatch(getUserData(accessToken));
    dispatch(setAsyncMessage(C.SUCCESS.imgUpdate));
    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.log("error: ", error);
    dispatch(setAsyncError(error));
  }
};

export default {
  setUserImgURL,
  imgUpload,
  fetchUserImgURL,
};
