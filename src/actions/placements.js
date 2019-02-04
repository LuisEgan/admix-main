import api from "../api";
import {
  setAsyncError,
  setAsyncLoading,
  setAsyncMessage,
} from "./asyncActions";
import { SET_PLACEMENTS, SET_PLACEMENTS_BY_ID, APPS_SUCCESS } from "./actions";
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

const getPlacementsByAppId = (appId, accessToken) => async dispatch => {
  const data = {
    appId,
  };

  try {
    const res = await api.getPlacements(accessToken, data);
    if (!res.status) throw res.message;

    dispatch({
      type: SET_PLACEMENTS_BY_ID,
      data: res,
    });
    dispatch(setAsyncLoading(false));
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

export default {
  getPlacements,
  getPlacementsByAppId,
  updatePlacements,
};
