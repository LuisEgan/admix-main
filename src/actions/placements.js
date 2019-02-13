import api from "../api";
import {
  setAsyncError,
  setAsyncLoading,
  setAsyncMessage,
} from "./asyncActions";
import {
  SET_PLACEMENTS,
  SET_PLACEMENTS_BY_ID,
  APPS_SUCCESS,
  UNSET_PLACEMENTS_BY_ID,
} from "./actions";
import C from "../utils/constants";

const getPlacements = (appId, sceneId, accessToken) => async dispatch => {
  const data = {
    appId,
    sceneId,
  };

  try {
    const res = await api.getPlacements(accessToken, data);
    if (!res.status) throw res.message;

    dispatch({
      type: SET_PLACEMENTS,
      data: res,
    });
    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.log("error: ", error);
    dispatch(setAsyncError(error));
  }
};

const getPlacementsAdmin = ({
  appId,
  sceneId,
  accessToken,
  adminToken,
}) => async dispatch => {
  const data = {
    appId,
    sceneId,
  };

  try {
    const res = await api.getPlacementsAdmin(accessToken, adminToken, data);
    if (!res.status) throw res.message;

    dispatch({
      type: SET_PLACEMENTS,
      data: res,
    });
    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.log("error: ", error);
    dispatch(setAsyncError(error));
  }
};

const getPlacementsByAppId = ({
  appId,
  accessToken,
  adminToken,
  noSetAsync,
}) => async dispatch => {
  !noSetAsync && dispatch(setAsyncLoading(true));
  const data = {
    appId,
  };

  try {
    const res = adminToken
      ? await api.getPlacementsAdmin(accessToken, adminToken, data)
      : await api.getPlacements(accessToken, data);
    if (!res.status) throw res.message;

    dispatch({
      type: SET_PLACEMENTS_BY_ID,
      data: res,
    });
    !noSetAsync && dispatch(setAsyncLoading(false));
  } catch (error) {
    console.log("error: ", error);
    dispatch(setAsyncError(error));
  }
};

const updatePlacements = ({
  accessToken,
  data,
  adminToken,
}) => async dispatch => {
  const placement = data[data.length - 1];
  const { placementId, ...newData } = placement;
  data = {
    placementId,
    newData,
  };

  try {
    const res = !adminToken
      ? await api.updatePlacements(accessToken, data)
      : await api.updatePlacementsAdmin(accessToken, adminToken, data);

    if (!res.status) throw res.message;
    dispatch({
      type: APPS_SUCCESS,
      data,
    });
    dispatch(setAsyncMessage(C.SUCCESS.appUpdated));
    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.log("error: ", error);
    dispatch(setAsyncError(error));
  }
};

const unsetPlacementByAppId = ({ appId }) => dispatch => {
  dispatch({
    type: UNSET_PLACEMENTS_BY_ID,
    appId,
  });
};

export default {
  getPlacements,
  getPlacementsAdmin,
  getPlacementsByAppId,
  updatePlacements,
  unsetPlacementByAppId
};
