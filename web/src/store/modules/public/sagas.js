import { all, takeLatest, call, put } from 'redux-saga/effects';
import api from '../../../services/api';
import types from './types';
import { updatePublicData, updateAvailability, updateAppointment, updateClientAppointments, updateClientRegistration } from './actions';
import { showErrorToast, showSuccessToast } from '../../../utils/notifications';

function* fetchPublicData({ customLink, dataType }) {
    try {
        const endpoint = dataType === 'e'
            ? `/public/e/${customLink}`
            : `/public/p/${customLink}`;
        
        // Não há necessidade de verificar o token aqui
        const { data: response } = yield call(api.get, endpoint);

        if (response.error) {
            showErrorToast(response.message);
            return;
        }
     
        yield put(updatePublicData(response));
    } catch (err) {
        console.error("Erro na requisição:", err.response?.data || err.message);
        showErrorToast(err.message || 'Erro ao buscar dados públicos');
    }
}

function* checkAvailability({ availabilityData }) {
    try {
        const { data: response } = yield call(api.post, '/public/disponibilidade', availabilityData);
     

        if (response.error) {
            showErrorToast(response.message);
            return;
        }

        // Verifica se a resposta contém o array de horários disponíveis
        if (Array.isArray(response.horariosDisponiveis)) {
            // Atualiza os horários disponíveis no estado
            yield put(updateAvailability(response.horariosDisponiveis));
        } else {
            showErrorToast('Formato inesperado na resposta do servidor.');
        }
    } catch (err) {
        console.error("Erro ao verificar disponibilidade:", err.response?.data || err.message);
        showErrorToast(err.message || 'Erro ao verificar disponibilidade');
    }
}

function* createAppointment({ appointmentData }) {
    try {
        // Valida se o profissionalId está presente e correto
        if (!appointmentData.profissionalId) {
            showErrorToast('Selecione um profissional antes de confirmar o agendamento.');
            return;
        }

        const { data: response } = yield call(api.post, '/public/agendar', appointmentData);

        if (response.error) {
            showErrorToast(response.message);
            return;
        }

        yield put(updateAppointment(response.agendamento));
        showSuccessToast('Agendamento realizado com sucesso!');
    } catch (err) {
        showErrorToast(err.message || 'Erro ao criar agendamento');
    }
}

function* fetchClientAppointments({ clientData }) {
    try {
        const { data: response } = yield call(api.post, '/public/agendamentos-cliente', clientData);

        if (response.error) {
            showErrorToast(response.message);
            return;
        }

        yield put(updateClientAppointments(response.agendamentos));
    } catch (err) {
        showErrorToast(err.message || 'Erro ao buscar agendamentos do cliente');
    }
}

function* registerClient({ clientData }) {
    try {
        const { data: response } = yield call(api.post, '/public/cliente/registro', clientData);
        console.log('Register response:', response);
        console.log('Client data:', clientData);
        if (response.error) {
            showErrorToast(response.message);
            yield put(updateClientRegistration({ step: 1, success: false, message: response.message }));
            return;
        }

        // LOG antes do put
        console.log('Saga vai enviar para reducer:', { step: 2, success: true, data: clientData, message: response.message });
        // Mesmo que a resposta não tenha step, envie para o reducer o step 2
        yield put(updateClientRegistration({ 
            step: 2,
            success: true,
            data: clientData,
            message: response.message // opcional, para mostrar na tela
        }));
        
        showSuccessToast('Código enviado! Verifique seu celular.');
    } catch (err) {
        console.error("Erro ao registrar cliente:", err);
        yield put(updateClientRegistration({ step: 1, success: false, message: 'Erro ao enviar código de verificação' }));
        showErrorToast('Erro ao enviar código de verificação');
    }
}

function* verifyClient({ verificationData }) {
    try {
        const { data: response } = yield call(api.post, '/public/cliente/verificar', verificationData);
        console.log('Verification response:', response);

        if (response.error) {
            showErrorToast(response.message);
            return;
        }

        yield put(updateClientRegistration({ 
            step: 3,
            success: true,
            clientData: response.cliente
        }));
        
        showSuccessToast('Verificação concluída!');
    } catch (err) {
        console.error("Erro ao verificar código:", err);
        showErrorToast('Erro ao verificar código');
    }
}

export default all([
    takeLatest(types.FETCH_PUBLIC_DATA, fetchPublicData),
    takeLatest(types.CHECK_AVAILABILITY, checkAvailability),
    takeLatest(types.CREATE_APPOINTMENT, createAppointment),
    takeLatest(types.FETCH_CLIENT_APPOINTMENTS, fetchClientAppointments),
    takeLatest(types.REGISTER_CLIENT, registerClient),
    takeLatest(types.VERIFY_CLIENT, verifyClient),
]);
