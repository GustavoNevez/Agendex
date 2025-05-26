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
        
        const { data: response } = yield call(api.get, endpoint);
        if (response.error) {
            showErrorToast(response.message);
            yield put(updateClientRegistration({ userToken: false }));
            yield put(updateClientAppointments([]));
            return;
        }
        yield put(updatePublicData(response));

        // Checa se está logado e busca agendamentos do cliente
        try {
            // customLink agora faz parte da URL
        
            const { data: agResp } = yield call(
                api.post,
                `/public-private/e/${customLink}/agendamentos-cliente`,
                {}, // body vazio
                { withCredentials: true }
            );
      
            if (agResp && Array.isArray(agResp.agendamentos)) {
                yield put(updateClientRegistration({ userToken: true }));
                yield put(updateClientAppointments(agResp.agendamentos));
            } else {
                yield put(updateClientRegistration({ userToken: false }));
                yield put(updateClientAppointments([]));
            }
        } catch (err) {
            yield put(updateClientRegistration({ userToken: false }));
            yield put(updateClientAppointments([]));
        }
    } catch (err) {
        showErrorToast(err.message || 'Erro ao buscar dados públicos');
        yield put(updateClientRegistration({ userToken: false }));
        yield put(updateClientAppointments([]));
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
            // Adicione um pequeno delay para garantir que o loading seja perceptível antes de atualizar
            yield put(updateAvailability([])); // Limpa imediatamente antes de mostrar loading
            yield call(() => new Promise(res => setTimeout(res, 200))); // Delay de 200ms
            yield put(updateAvailability(response.horariosDisponiveis));
        } else {
            showErrorToast('Formato inesperado na resposta do servidor.');
        }
    } catch (err) {
    
        showErrorToast(err.message || 'Erro ao verificar disponibilidade');
    }
}

function* createAppointment(action) {
    try {
        const { profissionalId, customLink, ...rest } = action;
        // Debug: veja o valor recebido
       

        // Corrija o acesso ao profissionalId
        if (!profissionalId) {
         
            showErrorToast('Selecione um profissional antes de confirmar o agendamento.', action.appointmentData.profissionalId);
            return;
        }
        // Use customLink na URL, NÃO envie no body!
        const { data: response } = yield call(
            api.post,
            `/public-private/e/${customLink}/agendamento`,
            { ...rest, profissionalId },
            { withCredentials: true }
        );
    
        if (response.error) {
            showErrorToast(response.message);
            return;
        }

        yield put(updateAppointment(response.agendamento));
        console.log('Agendamento criado com sucesso:', response.agendamento);
        showSuccessToast('Agendamento realizado com sucesso!');
    } catch (err) {
        showErrorToast(err.message || 'Erro ao criar agendamento');
    }
}

function* fetchClientAppointments({ customLink }) {
    try {
        // customLink agora faz parte da URL
        const { data: agResp } = yield call(
            api.post,
            `/public-private/e/${customLink}/agendamentos-cliente`,
            {}, // body vazio
            { withCredentials: true }
        );
        if (agResp && Array.isArray(agResp.agendamentos)) {
            yield put(updateClientRegistration({ userToken: true }));
            yield put(updateClientAppointments(agResp.agendamentos));
        } else {
            yield put(updateClientRegistration({ userToken: false }));
            yield put(updateClientAppointments([]));
        }
    } catch (err) {
        yield put(updateClientRegistration({ userToken: false }));
        yield put(updateClientAppointments([]));
    }
}

// Novo saga para excluir agendamento do cliente
function* deleteClientAppointment({ customLink, id }) {
    try {
        const { data: response } = yield call(
            api.delete,
            `/public-private/e/agendamento/${id}`,
            { withCredentials: true }
        );
        if (response.error) {
            showErrorToast(response.message);
            return;
        }
        showSuccessToast('Agendamento cancelado com sucesso!');
        // Atualiza lista de agendamentos após exclusão
        yield call(fetchClientAppointments, { customLink });
    } catch (err) {
        showErrorToast(err.message || 'Erro ao cancelar agendamento');
    }
}

function* registerClient({ clientData }) {
    try {
        const { data: response } = yield call(api.post, '/public/cliente/registro', clientData);
        if (response.error) {
            showErrorToast(response.message);
            yield put(updateClientRegistration({ step: 1, success: false, message: response.message }));
            return;
        }
        yield put(updateClientRegistration({ 
            step: 2,
            success: true,
            data: clientData,
            message: response.message
        }));
        showSuccessToast('Código enviado! Verifique seu celular.');
        // Não busca agendamentos aqui, pois só após verificação
    } catch (err) {
        yield put(updateClientRegistration({ step: 1, success: false, message: 'Erro ao enviar código de verificação' }));
        showErrorToast('Erro ao enviar código de verificação');
    }
}

function* verifyClient({ verificationData }) {
    try {
        // Garante que o telefone está no formato +55
        let telefone = verificationData.telefone || '';
        if (!telefone.startsWith('+55')) {
            // Remove qualquer caractere não numérico e formata
            const digits = telefone.replace(/\D/g, '').slice(0, 11);
            if (digits.length >= 10) {
                telefone = `+55 (${digits.slice(0, 2)})${digits.slice(2)}`;
            }
        }
        const dataToSend = { ...verificationData, telefone };

        const { data: response } = yield call(api.post, '/public/cliente/verificar', dataToSend);
    
     
        if (response.error) {
            showErrorToast(response.message);
            yield put(updateClientRegistration({ step: 3, success: false, message: response.message }));
            return;
        }

        yield put(updateClientRegistration({ 
            step: 3,
            success: true,
            clientData: response.cliente,
            token: response.token
        }));
        showSuccessToast('Verificação concluída!');
        // Busca agendamentos do cliente após verificação bem-sucedida
        if (verificationData.estabelecimentoId && verificationData.customLink) {
            yield call(fetchClientAppointments, { customLink: verificationData.customLink });
        }
    } catch (err) {
 
        showErrorToast('Erro ao verificar código');
        yield put(updateClientRegistration({ step: 3, success: false, message: 'Erro ao verificar código' }));
    }
}

function* loginClient({ loginData }) {
    try {
        const { data: response } = yield call(api.post, '/public/cliente/login', loginData);

        if (response.error) {
            showErrorToast(response.message);
            yield put(updateClientRegistration({ step: 1, success: false, message: response.message, userToken: false })); // deslogado
            return;
        }

        yield put(updateClientRegistration({
            step: 3,
            success: true,
            clientData: response.cliente,
            token: response.token,
            userToken: true // logado
        }));
        
        showSuccessToast('Login realizado com sucesso!');
        // Busca agendamentos do cliente após login bem-sucedido
        if (loginData.customLink) {
            yield call(fetchClientAppointments, { customLink: loginData.customLink });
        }
    } catch (err) {
        showErrorToast(err.message || 'Erro ao fazer login');
        yield put(updateClientRegistration({ step: 1, success: false, message: 'Erro ao fazer login', userToken: false })); // deslogado
    }
}

export default all([
    takeLatest(types.FETCH_PUBLIC_DATA, fetchPublicData),
    takeLatest(types.CHECK_AVAILABILITY, checkAvailability),
    takeLatest(types.CREATE_APPOINTMENT, createAppointment),
    takeLatest(types.FETCH_CLIENT_APPOINTMENTS, fetchClientAppointments),
    takeLatest(types.REGISTER_CLIENT, registerClient),
    takeLatest(types.VERIFY_CLIENT, verifyClient),
    takeLatest(types.LOGIN_CLIENT, loginClient),
    // Adicione o watcher para exclusão
    takeLatest(types.DELETE_CLIENT_APPOINTMENT, deleteClientAppointment),
]);
