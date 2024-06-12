import {all} from 'redux-saga/effects';
import agendamento from './modules/agendamento/sagas';
import clientes from './modules/cliente/sagas';
import servico from './modules/servico/sagas';

export default function* rootSaga() {
    return yield all([agendamento,clientes,servico]);
};