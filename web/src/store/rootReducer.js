import { combineReducers} from 'redux'
import agendamento from './modules/agendamento/reducer';
import clientes from './modules/cliente/reducer';
import servico from './modules/servico/reducer';
import relatorio from './modules/relatorio/reducer';

export default combineReducers({
    agendamento,
    clientes,
    servico,
    relatorio,  
});