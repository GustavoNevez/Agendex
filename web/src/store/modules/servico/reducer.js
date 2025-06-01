import produce from 'immer';
import types from './types';
import moment from 'moment';

const INITIAL_STATE = {
    servico: {
        titulo: '',
        preco: '',
        recorrencia: '',
        duracao: '',
        status: 'A',
        descricao: ''
    },
    servicos: [],
    componentes: {
        drawer: false,
        confirmDelete: false,
        confirmUpdate: false
    },
    estadoFormulario: {
        saving: false,
        filtering: false
    },
    comportamento: 'create'
};

const servicoReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case '@servico/UPDATE_SERVICO':
            return {
                ...state,
                ...action.payload,
                servico: {
                    ...state.servico,
                    ...action.payload.servico
                },
                componentes: {
                    ...state.componentes,
                    ...action.payload.componentes
                }
            };

        case '@servico/ADD_SERVICO':
            return {
                ...state,
                servicos: [...state.servicos, {...state.servico}],
                servico: INITIAL_STATE.servico,
                componentes: {
                    ...state.componentes,
                    drawer: false
                }
            };

        case '@servico/RESET_SERVICO':
            return {
                ...state,
                servico: INITIAL_STATE.servico,
                comportamento: action.payload?.comportamento || 'create'
            };

        default:
            return state;
    }
};

export default servicoReducer;