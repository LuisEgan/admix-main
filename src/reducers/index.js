import app from "./app";
import async from "./asyncReducers";
import { reducer as formReducer } from "redux-form";

export default {
  app,
  async,
  form: formReducer
};
