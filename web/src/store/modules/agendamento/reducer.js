// src/store/modules/agendamento/reducer.js

import types from './types';
import produce from 'immer';

const INITIAL_STATE = {
    comportamento: 'create',
    componentes: {
        drawer: false,
        confirmDelete: false,
        confirmUpdate: false,
    },
    estadoFormulario: {
        filtering: false,
        disabled: true,
        saving: false,
    },
    agendamentos: [],
    agendamentosDisponiveis: [],
    servicos: [],
    diasDisponiveis: [],
    clientes: [], // Lista de clientes
    profissionais: [], // Lista de profissionais
    agendamentosSemana: [], // Lista de agendamentos dos próximos 7 dias
    publicData: {
        estabelecimento: null,
        profissional: null,
        servicos: [],
        diasDisponiveis: [],
        loading: false,
        error: null
    }
};

function agendamento(state = INITIAL_STATE, action) {
    switch (action.type) {
        case types.UPDATE_AGENDAMENTO: {
            return produce(state, (draft) => {
                draft.agendamentos = action.agendamentos || [];
            });
        }
        case types.UPDATE_SERVICOS: {
            return produce(state, (draft) => {
                draft.servicos = action.servicos || [];
            });
        }
        case types.UPDATE_DIAS_DISPONIVEIS: {
            return produce(state, (draft) => {
                draft.diasDisponiveis = action.diasDisponiveis || [];
            });
        }
        case types.UPDATE_CLIENTES: {
            return produce(state, (draft) => {
                draft.clientes = action.clientes || [];
            });
        }
        case types.UPDATE_PROFISSIONAIS: {
            return produce(state, (draft) => {
                draft.profissionais = action.profissionais || [];
            });
        }
        case types.DELETE_AGENDAMENTO_SUCCESS: {
            return produce(state, (draft) => {
                draft.agendamentos = draft.agendamentos.filter(agendamento => agendamento._id !== action.id);
            });
        }
        case types.UPDATE_AGENDAMENTOS_SEMANA: {
            return produce(state, (draft) => {
                draft.agendamentosSemana = action.agendamentosSemana || [];
            });
        }
        case types.FETCH_PUBLIC_DIAS_DISPONIVEIS:
            return {
                ...state,
                publicData: {
                    ...state.publicData,
                    loading: true,
                    error: null
                }
            };
            
        case types.UPDATE_PUBLIC_DIAS_DISPONIVEIS:
            return {
                ...state,
                publicData: {
                    ...state.publicData,
                    diasDisponiveis: action.diasDisponiveis,
                    loading: false
                }
            };
        case types.UPDATE_PROFISSIONAL:
            return {
                ...state,
                publicData: {
                    ...state.publicData,
                    profissional: action.profissional,
                }
            };
        case types.UPDATE_PUBLIC_DATA:
            return {
                ...state,
                publicData: {
                    ...state.publicData,
                    ...action.data
                }
            };
        default:
            return state;
    }
}

export default agendamento;