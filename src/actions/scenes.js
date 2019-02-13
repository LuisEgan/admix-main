import api from "../api";
import { setAsyncError, setAsyncLoading } from "./asyncActions";
import { SELECT_APP, SET_SCENES_BY_ID, UNSET_SCENES_BY_ID } from "./actions";

const getScenes = (appId, accessToken) => async dispatch => {
  dispatch(setAsyncLoading(true));
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

const getScenesByAppId = ({
  appId,
  accessToken,
  adminToken,
  noSetAsync,
}) => async dispatch => {
  !noSetAsync && dispatch(setAsyncLoading(true));

  try {
    const res = adminToken
      ? await api.getScenesAdmin(accessToken, adminToken, appId)
      : await api.getScenes(accessToken, appId);
    if (!res.status) throw res.message;
    dispatch({
      type: SET_SCENES_BY_ID,
      data: res,
    });

    !noSetAsync && dispatch(setAsyncLoading(false));
  } catch (error) {
    console.log("error: ", error);
    dispatch(setAsyncError(error));
  }
};

const unsetScenesByAppId = ({ appId }) => dispatch => {
  dispatch({
    type: UNSET_SCENES_BY_ID,
    appId,
  });
};


export default {
  getScenes,
  getScenesByAppId,
  unsetScenesByAppId
};
