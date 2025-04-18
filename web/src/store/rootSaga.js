import {all} from 'redux-saga/effects';
import agendamento from './modules/agendamento/sagas';
import clientes from './modules/cliente/sagas';
import servico from './modules/servico/sagas';
import relatorio from './modules/relatorio/sagas';
import profissional from './modules/profissional/sagas';
import turno from './modules/turno/sagas';

export default function* rootSaga() {
    return yield all([agendamento, clientes, servico, relatorio, profissional, turno]);
};