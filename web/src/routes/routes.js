
import Sidebar from '../components/Sidebar'
import Agendamentos from '../pages/Agendamentos';
import Cliente from '../pages/Clientes';
import Servicos from '../pages/Servico';
import Registro from '../pages/Registro';
import Login from '../pages/Login';
import PrivateRoute from './privateRoutes';
import NotFound from '../components/NotFound';

import '../styles.css'
import {BrowserRouter as Router, Route, Switch,useLocation} from 'react-router-dom'



const Routers = () => {

    
    return (
        <>
        <div className="">
           <div className=" row h-100">
           
                <Router>
                    
                    <Sidebar hideOnRoutes={['/agendamentos', '/servico','/cliente']} />        
                    <Switch>
                                            
                        <PrivateRoute path="/agendamentos" exact component={Agendamentos}/>
                        <PrivateRoute path="/servico" exact component={Servicos}/>
                            
                        <PrivateRoute path="/cliente" exact component={Cliente}/>
                        <Route path="/registro" exact component={Registro}/>
                        <Route path="/login" exact component={Login}/>
                        <Route path="/" exact component={Login}/>
                        <Route component={NotFound} />

                    </Switch>
                </Router>
            
            </div>
        </div>
        </>
    );
};

export default Routers;