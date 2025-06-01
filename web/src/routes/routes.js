import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import PrivateRoute from './privateRoutes';
import NotFound from '../components/NotFound';

// Páginas
import Agendamentos from '../pages/Agendamentos/agendamentos_page';
import Cliente from '../pages/Clientes/cliente_page';
import Servicos from '../pages/Servico/servico_page';
import Relatorio from '../pages/Relatorio/relatorio_page';
import Profissionais from '../pages/Profissionais/profissional_view';
import Horarios from '../pages/Horarios/horarios_page';
import Registro from '../pages/Registro/registro_page';
import Login from '../pages/Login/login_page';
import Dashboard from '../pages/Dashboard/dashboard_page';
import LinksManagement from '../pages/LinksManagement/links_page';
import PublicScheduling from '../pages/PublicScheduling/public_page';
import SMSVerification from '../pages/SMSVerification/sms_page';

import '../styles.css';

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
          <PrivateRoute path="/relatorio" exact component={Relatorio} />
          <PrivateRoute path="/profissionais" exact component={Profissionais} />
          <PrivateRoute path="/horarios" exact component={Horarios} />
          <PrivateRoute path="/cliente" exact component={Cliente} />
          <PrivateRoute path="/links" exact component={LinksManagement} />
          
          {/* Rotas públicas */}
          <Route path="/registro" exact component={Registro} />
          <Route path="/login" exact component={Login} />
          <Route path="/" exact component={Login} />
          <Route path="/verificacao-sms" exact component={SMSVerification} />
          
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