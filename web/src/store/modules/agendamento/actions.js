// src/store/modules/agendamento/actions.js

import types from './types';

export const updateAgendamento = (agendamentos) => ({
    type: types.UPDATE_AGENDAMENTO,
    agendamentos,
});

export const updateServicos = (servicos) => ({
    type: types.UPDATE_SERVICOS,
    servicos,
});

export const updateClientes = (clientes) => ({
    type: types.UPDATE_CLIENTES,
    clientes,
});

export const filtroAgendamento = (start, end) => ({
    type: types.FILTRO_AGENDAMENTOS,
    start,
    end,
});

export const fetchServicos = () => ({
    type: types.FETCH_SERVICOS,
});

export const fetchClientes = () => ({
    type: types.FETCH_CLIENTES,
});

export const fetchDiasDisponiveis = (estabelecimentoId, data, servicoId) => ({
    type: types.FETCH_DIAS_DISPONIVEIS,
    estabelecimentoId,
    data,
    servicoId,
});

export const updateDiasDisponiveis = (diasDisponiveis) => ({
    type: types.UPDATE_DIAS_DISPONIVEIS,
    diasDisponiveis,
});

export const saveAgendamento = (agendamento) => ({
    type: types.SAVE_AGENDAMENTO,
    agendamento,
});

export const deleteAgendamento = (id) => ({
    type: types.DELETE_AGENDAMENTO,
    id,
});

export const deleteAgendamentoSuccess = (id) => ({
    type: types.DELETE_AGENDAMENTO_SUCCESS,
    id,
});
