import api from "../api";
import { setAsyncError } from "./asyncActions";
import { USER_DATA_SUCCESS, UPDATE_USER } from "./actions";

const showUserData = data => {
  if (data.status) {
    return {
      type: USER_DATA_SUCCESS,
      data,
    };
  }
};

const updateUserRes = data => {
  if (data.status) {
    return {
      type: UPDATE_USER,
      data,
    };
  }
};

// * FETCH

const getUserData = accessToken => dispatch => {
  api
    .getUserData(accessToken)
    .then(data => dispatch(showUserData(data)))
    .catch(error => dispatch(setAsyncError(error)));
};

const updateUser = (userId, newData, accessToken) => dispatch => {
  const body = {
    userId,
    newData,
  };

  api
    .updateUser(accessToken, body)
    .then(data => {
      dispatch(updateUserRes(data));
      if (data.status) {
        dispatch(getUserData(accessToken));
      }
    })
    .catch(error => {
      dispatch(setAsyncError(error));
    });
};

export default {
  getUserData,
  updateUser,
};
