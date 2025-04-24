import { all, takeLatest, call, put } from 'redux-saga/effects';
import api from '../../../services/api';
import types from './types';
import { updateAgendamento, updateServicos, updateDiasDisponiveis, updateClientes, updateProfissionais, deleteAgendamentoSuccess, finalizeAgendamentoSuccess, updateAgendamentosSemana } from './actions';
import { showErrorToast, showSuccessToast } from '../../../utils/notifications';
export function* fetchProximosSeteDias({ estabelecimentoId }) {
    try {
        // Se não receber o estabelecimentoId como parâmetro, busca do localStorage
        if (!estabelecimentoId) {
            const storedUser = localStorage.getItem("@Auth:user");
            const user = JSON.parse(storedUser);
            estabelecimentoId = user.id;
        }
        
        const { data: response } = yield call(api.get, `/agendamento/proximos-sete-dias/${estabelecimentoId}`);
        
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        
        yield put(updateAgendamentosSemana(response.agendamentos));
    } catch (err) {
        showErrorToast(err.message);
    }
}
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
        const agendamentosAtivos = response.agendamentos.filter(agendamento => agendamento.status === 'A');
        yield put(updateAgendamento(agendamentosAtivos));
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
        console.log(servicosAtivos)
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

export function* fetchDiasDisponiveis({ estabelecimentoId, data, servicoId, profissionalId }) {
    try {
        const { data: response } = yield call(api.post, '/agendamento/horarios-disponiveis', {
            estabelecimentoId,
            data,
            servicoId,
            profissionalId,
        });
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        
        // Transform the response from the new endpoint format to the expected format
        // Convert flat array of times to the format expected by the component
        const formattedTimes = response.horariosDisponiveis.map(time => [time]);
        const formattedAgenda = [{
            [response.data]: formattedTimes
        }];
        
        yield put(updateDiasDisponiveis(formattedAgenda));
    } catch (err) {
        showErrorToast(err.message);
    }
}
export function* fetchDiasDisponiveisProfissional({ estabelecimentoId, data, servicoId, profissionalId }) {
    try {
        const { data: response } = yield call(api.post, '/agendamento/horarios-disponiveis', {
            estabelecimentoId,
            data,
            servicoId,
            profissionalId,
        });
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        
        // Transform the response from the new endpoint format to the expected format
        // Convert flat array of times to the format expected by the component
        const formattedTimes = response.horariosDisponiveis.map(time => [time]);
        const formattedAgenda = [{
            [response.data]: formattedTimes
        }];
        
        yield put(updateDiasDisponiveis(formattedAgenda));
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

export function* finalizeAgendamento({ id }) {
    try {
        const { data: response } = yield call(api.put, `/agendamento/concluido/${id}`);
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        yield put(finalizeAgendamentoSuccess(id));
        showSuccessToast('Agendamento finalizado com sucesso!');
    } catch (err) {
        showErrorToast(err.message);
    }
}

export function* fetchProfissionais() {
    try {
        const storedUser = localStorage.getItem("@Auth:user");
        const user = JSON.parse(storedUser);
        const estabelecimentoId = user.id;
        const { data: response } = yield call(api.get, `/profissional/estabelecimento/${estabelecimentoId}`);
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        // Assumindo que a resposta tem uma propriedade 'profissionais' com a lista de profissionais ativos
        const profissionaisAtivos = response.profissionais.filter(profissional => profissional.status === 'A');
        yield put(updateProfissionais(profissionaisAtivos));
    } catch (err) {
        showErrorToast(err.message);
    }
}


export default all([
    takeLatest(types.FILTRO_AGENDAMENTOS, filterAgendamento),
    takeLatest(types.FETCH_SERVICOS, fetchServicos),
    takeLatest(types.FETCH_CLIENTES, fetchClientes),
    takeLatest(types.FETCH_PROFISSIONAIS, fetchProfissionais),
    takeLatest(types.FETCH_DIAS_DISPONIVEIS, fetchDiasDisponiveis),
    takeLatest(types.FETCH_DIAS_DISPONIVEIS_PROFISSIONAL, fetchDiasDisponiveisProfissional),
    takeLatest(types.SAVE_AGENDAMENTO, saveAgendamento),
    takeLatest(types.DELETE_AGENDAMENTO, deleteAgendamento),
    takeLatest(types.FINALIZE_AGENDAMENTO, finalizeAgendamento),
    takeLatest(types.FETCH_PROXIMOS_SETE_DIAS, fetchProximosSeteDias),
]);
