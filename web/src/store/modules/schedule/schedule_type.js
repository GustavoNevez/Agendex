// src/store/modules/agendamento/types.js

const types = {
    UPDATE_AGENDAMENTO: '@agendamento/UPDATE_AGENDAMENTO',
    UPDATE_SERVICOS: '@agendamento/UPDATE_SERVICOS',
    UPDATE_CLIENTES: '@agendamento/UPDATE_CLIENTES',UPDATE_PROFISSIONAIS: '@agendamento/UPDATE_PROFISSIONAIS',
    
    FILTRO_AGENDAMENTOS: '@agendamento/FILTRO_AGENDAMENTOS',
    FETCH_SERVICOS: '@agendamento/FETCH_SERVICOS',
    FETCH_CLIENTES: '@agendamento/FETCH_CLIENTES',
    FETCH_PROFISSIONAIS: '@agendamento/FETCH_PROFISSIONAIS',
    FETCH_DIAS_DISPONIVEIS: '@agendamento/FETCH_DIAS_DISPONIVEIS',
    FETCH_DIAS_DISPONIVEIS_PROFISSIONAL: '@agendamento/FETCH_DIAS_DISPONIVEIS_PROFISSIONAL',
    UPDATE_DIAS_DISPONIVEIS: '@agendamento/UPDATE_DIAS_DISPONIVEIS',
    SAVE_AGENDAMENTO: '@agendamento/SAVE_AGENDAMENTO',
    DELETE_AGENDAMENTO: '@agendamento/DELETE_AGENDAMENTO',
    DELETE_AGENDAMENTO_SUCCESS: '@agendamento/DELETE_AGENDAMENTO_SUCCESS',
    FINALIZE_AGENDAMENTO: 'FINALIZE_AGENDAMENTO',
    FINALIZE_AGENDAMENTO_SUCCESS: 'FINALIZE_AGENDAMENTO_SUCCESS',
    FETCH_PROXIMOS_SETE_DIAS: '@agendamento/FETCH_PROXIMOS_SETE_DIAS',
    UPDATE_AGENDAMENTOS_SEMANA: '@agendamento/UPDATE_AGENDAMENTOS_SEMANA',
};

export default types;
