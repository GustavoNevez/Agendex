import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import PrivateRoute from './privateRoutes';
import NotFound from '../components/NotFound';

// Páginas
import Agendamentos from '../pages/Agendamentos';
import Cliente from '../pages/Clientes';
import Servicos from '../pages/Servico';
import Relatorio from '../pages/Relatorio';
import Registro from '../pages/Registro';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';

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
          <PrivateRoute path="/dashboard" exact component={Dashboard} />
          <PrivateRoute path="/agendamentos" exact component={Agendamentos} />
          <PrivateRoute path="/servico" exact component={Servicos} />
          <PrivateRoute path="/relatorio" exact component={Relatorio} />        
          <PrivateRoute path="/cliente" exact component={Cliente} />
          
          {/* Rotas públicas */}
          <Route path="/registro" exact component={Registro} />
          <Route path="/login" exact component={Login} />
          <Route path="/" exact component={Login} />
          
          {/* Rota de fallback */}
          <Route component={NotFound} />
        </Switch>
      </Router>
    </div>
  );
};

export default Routers;