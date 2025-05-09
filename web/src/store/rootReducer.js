import { combineReducers} from 'redux'
import agendamento from './modules/agendamento/reducer';
import clientes from './modules/cliente/reducer';
import servico from './modules/servico/reducer';
import relatorio from './modules/relatorio/reducer';
import profissional from './modules/profissional/reducer';
import turno from './modules/turno/reducer';
import publicReducer from './modules/public/reducer';

export default combineReducers({
    agendamento,
    clientes,
    servico,
    relatorio,
    profissional,
    turno,
    public: publicReducer,
});