import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import PrivateRoute from "./privateRoutes";
import NotFound from "../components/NotFound/notfound_custom";

// Páginas
import Agendamentos from "../pages/Schedule/schedule_view";
import Cliente from "../pages/Client/client_view";
import Servicos from "../pages/Service/service_view";

import Profissionais from "../pages/Professional/professional_view";
import Horarios from "../pages/Shift/shift_view";
import Registro from "../pages/Register/register_view";
import Login from "../pages/Login/login_view";
import Dashboard from "../pages/Report/report_view";
import LinksManagement from "../pages/LinksManagement/link_view";
import PublicScheduling from "../pages/PublicScheduling/public_view";

import "../styles/styles.css";

/**
 * Componente principal de rotas da aplicação
 *
 * Esta implementação:
 * 1. Remove completamente as referências aos componentes antigos (Sidebar, Header)
 * 2. Usa o PrivateRoute atualizado que já inclui o layout autenticado com componentes responsivos
 */
const Routers = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <Switch>
          {/* Rotas privadas com layout autenticado */}
          <PrivateRoute path="/agendamentos" exact component={Agendamentos} />
          <PrivateRoute path="/dashboard" exact component={Dashboard} />
          <PrivateRoute path="/servico" exact component={Servicos} />
          <PrivateRoute path="/profissionais" exact component={Profissionais} />
          <PrivateRoute path="/horarios" exact component={Horarios} />
          <PrivateRoute path="/cliente" exact component={Cliente} />
          <PrivateRoute path="/links" exact component={LinksManagement} />

          {/* Rotas públicas */}
          <Route path="/registro" exact component={Registro} />
          <Route path="/login" exact component={Login} />
          <Route path="/" exact component={Login} />

          {/* Rotas públicas para agendamento via links personalizados */}
          <Route path="/public/e/:customLink" component={PublicScheduling} />
          <Route path="/public/p/:customLink" component={PublicScheduling} />

          {/* Rota de fallback */}
          <Route component={NotFound} />
        </Switch>
      </Router>
    </div>
  );
};

export default Routers;
