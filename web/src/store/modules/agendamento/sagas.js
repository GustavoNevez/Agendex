import { all, takeLatest, call, put } from 'redux-saga/effects';
import api from '../../../services/api';
import types from './types';
import { updateAgendamento, updateServicos, updateDiasDisponiveis, updateClientes, deleteAgendamentoSuccess } from './actions';
import { showErrorToast, showSuccessToast } from '../../../utils/notifications';

export function* filterAgendamento({ start, end }) {
    try {
        const storedUser = localStorage.getItem("@Auth:user");
        const user = JSON.parse(storedUser);
        const estabelecimentoId = user.id;
        const { data: response } = yield call(api.post, '/agendamento/FILTRO', {
            estabelecimentoId,
            periodo: {
                inicio: start,
                final: end,
            },
        });
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        yield put(updateAgendamento(response.agendamentos));
    } catch (err) {
        showErrorToast(err.message);
    }
}

export function* fetchServicos() {
    try {
        const storedUser = localStorage.getItem("@Auth:user");
        const user = JSON.parse(storedUser);
        const estabelecimentoId = user.id;
        const { data: response } = yield call(api.get, `/servico/estabelecimento/${estabelecimentoId}`);
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        const servicosAtivos = response.servicos.filter(servico => servico.status === 'A');
        yield put(updateServicos(servicosAtivos));
    } catch (err) {
        showErrorToast(err.message);
    }
}

export function* fetchClientes() {
    try {
        const storedUser = localStorage.getItem("@Auth:user");
        const user = JSON.parse(storedUser);
        const estabelecimentoId = user.id;
        const { data: response } = yield call(api.get, `/cliente/clientes/${estabelecimentoId}`);
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        yield put(updateClientes(response.clientes));
    } catch (err) {
        showErrorToast(err.message);
    }
}

export function* fetchDiasDisponiveis({ estabelecimentoId, data, servicoId }) {
    try {
        const { data: response } = yield call(api.post, '/agendamento/dias-disponiveis', {
            estabelecimentoId,
            data,
            servicoId,
        });
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        yield put(updateDiasDisponiveis(response.agenda));
    } catch (err) {
        showErrorToast(err.message);
    }
}

export function* saveAgendamento({ agendamento }) {
    try {
        const { data: response } = yield call(api.post, '/agendamento', agendamento);
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        showSuccessToast('Agendamento salvo com sucesso!');
    } catch (err) {
        showErrorToast(err.message);
    }
}

export function* deleteAgendamento({ id }) {
    try {
        const { data: response } = yield call(api.delete, `/agendamento/${id}`);
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        yield put(deleteAgendamentoSuccess(id));
        showSuccessToast('Agendamento excluído com sucesso!');
        
    } catch (err) {
        showErrorToast(err.message);
    }
}

export default all([
    takeLatest(types.FILTRO_AGENDAMENTOS, filterAgendamento),
    takeLatest(types.FETCH_SERVICOS, fetchServicos),
    takeLatest(types.FETCH_CLIENTES, fetchClientes),
    takeLatest(types.FETCH_DIAS_DISPONIVEIS, fetchDiasDisponiveis),
    takeLatest(types.SAVE_AGENDAMENTO, saveAgendamento),
    takeLatest(types.DELETE_AGENDAMENTO, deleteAgendamento),
]);
