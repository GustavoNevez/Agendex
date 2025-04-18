// src/store/modules/turno/sagas.js
import { all, takeLatest, call, put } from 'redux-saga/effects';
import api from '../../../services/api';
import types from './types';
import { 
    updateTurnos, 
    saveTurnoSuccess, 
    updateTurnoSuccess, 
    deleteTurnoSuccess, 
    toggleTurnoStatusSuccess 
} from './actions';
import { showErrorToast, showSuccessToast } from '../../../utils/notifications';

/**
 * Fetch turnos for the current establishment
 */
export function* fetchTurnos() {
    try {
        const storedUser = localStorage.getItem("@Auth:user");
        const user = JSON.parse(storedUser);
        const estabelecimentoId = user.id;
        
        const { data: response } = yield call(api.get, `/turno/estabelecimento/${estabelecimentoId}`);
        
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        
        yield put(updateTurnos(response.turnos));
    } catch (err) {
        console.error('Erro ao buscar turnos:', err);
        showErrorToast(err.message || 'Erro ao buscar turnos');
    }
}

/**
 * Save a new turno
 */
export function* saveTurno({ turno }) {
    try {
        // Make sure estabelecimentoId is set
        const storedUser = localStorage.getItem("@Auth:user");
        const user = JSON.parse(storedUser);
        
        const turnoData = {
            ...turno,
            estabelecimentoId: user.id
        };
        
        const { data: response } = yield call(api.post, '/turno', turnoData);
        
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        
        yield put(saveTurnoSuccess(response.turno));
        showSuccessToast('Turno criado com sucesso!');
    } catch (err) {
        console.error('Erro ao salvar turno:', err);
        showErrorToast(err.message || 'Erro ao salvar turno');
    }
}

/**
 * Update an existing turno
 */
export function* updateTurno({ turno }) {
    try {
        const { _id, ...turnoData } = turno;
        
        const { data: response } = yield call(api.put, `/turno/${_id}`, turnoData);
        
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        
        yield put(updateTurnoSuccess(turno));
        showSuccessToast('Turno atualizado com sucesso!');
    } catch (err) {
        console.error('Erro ao atualizar turno:', err);
        showErrorToast(err.message || 'Erro ao atualizar turno');
    }
}

/**
 * Delete a turno
 */
export function* deleteTurno({ id }) {
    try {
        const { data: response } = yield call(api.delete, `/turno/${id}`);
        
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        
        yield put(deleteTurnoSuccess(id));
        showSuccessToast('Turno excluído com sucesso!');
    } catch (err) {
        console.error('Erro ao excluir turno:', err);
        showErrorToast(err.message || 'Erro ao excluir turno');
    }
}

/**
 * Activate a turno
 */
export function* activateTurno({ id }) {
    try {
        const { data: response } = yield call(api.put, `/turno/status/${id}`, { status: 'A' });
        
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        
        yield put(toggleTurnoStatusSuccess(id, 'A'));
        showSuccessToast('Turno ativado com sucesso!');
    } catch (err) {
        console.error('Erro ao ativar turno:', err);
        showErrorToast(err.message || 'Erro ao ativar turno');
    }
}

/**
 * Deactivate a turno
 */
export function* deactivateTurno({ id }) {
    try {
        const { data: response } = yield call(api.put, `/turno/status/${id}`, { status: 'I' });
        
        if (response.error) {
            showErrorToast(response.message);
            return false;
        }
        
        yield put(toggleTurnoStatusSuccess(id, 'I'));
        showSuccessToast('Turno desativado com sucesso!');
    } catch (err) {
        console.error('Erro ao desativar turno:', err);
        showErrorToast(err.message || 'Erro ao desativar turno');
    }
}

export default all([
    takeLatest(types.FETCH_TURNOS, fetchTurnos),
    takeLatest(types.SAVE_TURNO, saveTurno),
    takeLatest(types.UPDATE_TURNO, updateTurno),
    takeLatest(types.DELETE_TURNO, deleteTurno),
    takeLatest(types.ACTIVATE_TURNO, activateTurno),
    takeLatest(types.DEACTIVATE_TURNO, deactivateTurno),
]);