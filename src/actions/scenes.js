import api from "../api";
import { setAsyncError, setAsyncLoading } from "./asyncActions";
import { SELECT_APP } from "./actions";

const getScenes = (appId, accessToken) => async dispatch => {
  try {
    const res = await api.getScenes(accessToken, appId);
    if (!res.status) throw res.message;

    const data = { appId, ...res };
    dispatch({
      type: SELECT_APP,
      data,
    });
    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.log("error: ", error);
    dispatch(setAsyncError(error));
  }
};

export default {
  getScenes,
};
