import { createStore, applyMiddleware, combineReducers } from "redux";
import { persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import immutableTransform from "redux-persist-transform-immutable";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";

import rootReducer from "../reducers";
import persistReducer from "redux-persist/lib/persistReducer";

const isProduction = process.env.NODE_ENV === "production";

const logger = createLogger({
  collapsed: true,
});

const middleware = isProduction
  ? applyMiddleware(thunk)
  : applyMiddleware(thunk, logger);

// Add redux-persist's configuration
const config = {
  transforms: [immutableTransform()],
  key: "root",
  storage,
  whitelist: ["app"],
  //    blacklist: ["app"]
};

const reducer = combineReducers(rootReducer);
const persistedReducer = persistReducer(config, reducer);

const store = createStore(persistedReducer, middleware);
let persistor = persistStore(store);

export default () => ({
  persistor,
  store,
});
