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
        default:
            return state;
    }
}

export default agendamento;