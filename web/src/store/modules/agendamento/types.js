// src/store/modules/agendamento/types.js

const types = {
    UPDATE_AGENDAMENTO: '@agendamento/UPDATE_AGENDAMENTO',
    UPDATE_SERVICOS: '@agendamento/UPDATE_SERVICOS',
    UPDATE_CLIENTES: '@agendamento/UPDATE_CLIENTES', // Adicionado
    FILTRO_AGENDAMENTOS: '@agendamento/FILTRO_AGENDAMENTOS',
    FETCH_SERVICOS: '@agendamento/FETCH_SERVICOS',
    FETCH_CLIENTES: '@agendamento/FETCH_CLIENTES', // Adicionado
    FETCH_DIAS_DISPONIVEIS: '@agendamento/FETCH_DIAS_DISPONIVEIS',
    UPDATE_DIAS_DISPONIVEIS: '@agendamento/UPDATE_DIAS_DISPONIVEIS',
    SAVE_AGENDAMENTO: '@agendamento/SAVE_AGENDAMENTO',
    DELETE_AGENDAMENTO: '@agendamento/DELETE_AGENDAMENTO',
    DELETE_AGENDAMENTO_SUCCESS: '@agendamento/DELETE_AGENDAMENTO_SUCCESS',
};

export default types;
