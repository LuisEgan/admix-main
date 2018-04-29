import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/es/integration/react";
import "./index.css";

// bootstrap
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

import configureStore from "./config/store";
// import App from "views/App";
import App from "./App";

const { persistor, store } = configureStore();

const render = Component => {
   ReactDOM.render(
      <Provider store={store}>
         <PersistGate persistor={persistor}>
            <BrowserRouter>
               <Component />
            </BrowserRouter>
         </PersistGate>
      </Provider>,
      document.getElementById("root")
   );
};

// Render app
render(App);
