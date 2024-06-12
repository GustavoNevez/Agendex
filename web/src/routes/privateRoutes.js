import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "../context/auth";
import Sidebar from "../components/Sidebar";

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { signed } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={props =>
        signed ? (
          <Component {...props} />
          
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;