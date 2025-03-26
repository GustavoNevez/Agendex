import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "../context/auth";
import AuthenticatedLayout from "../components/Layout/AuthenticatedLayout";

/**
 * Componente de rota privada que verifica autenticação e aplica o layout autenticado
 * 
 * Este componente:
 * 1. Verifica se o usuário está autenticado
 * 2. Redireciona para login se não estiver autenticado
 * 3. Renderiza o componente dentro do layout autenticado para usuários autenticados
 */
const PrivateRoute = ({ component: Component, ...rest }) => {
  const { signed } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={props =>
        signed ? (
          <AuthenticatedLayout>
            <Component {...props} />
          </AuthenticatedLayout>
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;