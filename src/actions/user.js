import api from "../api";
import { setAsyncError, setAsyncLoading, setAsyncMessage } from "./asyncActions";
import { USER_DATA_SUCCESS, UPDATE_USER } from "./actions";
import C from "../utils/constants"
const getUserData = accessToken => async dispatch => {
  dispatch(setAsyncLoading(true));
  try {
    const res = await api.getUserData(accessToken);
    if (!res.status) throw res.message;

    dispatch({
      type: USER_DATA_SUCCESS,
      data: res,
    });
    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.log("error: ", error);
    dispatch(setAsyncError(error));
  }
};

const updateUser = ({userId, newData, accessToken, noSetAsync}) => async dispatch => {
  dispatch(setAsyncLoading(true));
  const body = {
    userId,
    newData,
  };

  try {
    const res = await api.updateUser(accessToken, body);
    if (!res.status) throw res.message;

    dispatch({
      type: UPDATE_USER,
      data: res,
    });

    dispatch(getUserData(accessToken));
    !noSetAsync && dispatch(setAsyncMessage(C.SUCCESS.userUpdate));
    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.log("error: ", error);
    dispatch(setAsyncError(error));
  }
};

export default {
  getUserData,
  updateUser,
};
