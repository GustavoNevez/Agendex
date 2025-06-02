import React from "react";
import ReactDOM from "react-dom/client";
import Routers from "./routes/routes";
import { Provider } from "react-redux";
import store from "./store/store_saga";
import { AuthProvider } from "./context/auth_provider";
import { RouteProvider } from "./context/router_provider";
import { BrowserRouter as Router } from "react-router-dom";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";

import "@fontsource/urbanist/400.css";
import "@fontsource/urbanist/700.css";

import "@fontsource/gantari/400.css";
import "@fontsource/gantari/700.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <AuthProvider>
      <Router>
        <RouteProvider>
          <Routers />
        </RouteProvider>
      </Router>
    </AuthProvider>
  </Provider>
);
