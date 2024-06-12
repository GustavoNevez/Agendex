import produce from 'immer';
import types from './types';
import moment from 'moment';

const INITIAL_STATE = {
    comportamento:'create',
    componentes:{
        drawer:false,
        confirmDelete:false,
        confirmUpdate:false,
    },
    estadoFormulario:{
        filtereing:false,
        disabled:true,
        saving:false,
    },
    servicos: [],
    servico: {
        estabelecimentoId: '',
        id:'',
        titulo: '',
        preco: '',
        duracao: moment('00:30', 'HH:mm').format(),
        recorrencia: '',
        status: 'A',
        
      },
};

function servico(state = INITIAL_STATE, action) {
    switch(action.type) {
        case types.UPDATE_SERVICOS: {
            return produce(state, (draft) => {
                
                draft =  { ...draft, ...action.payload};
                return draft;
            });     
        }
        case types.RESET_SERVICOS: {
            return produce(state, (draft) => {
                
                draft.servico = INITIAL_STATE.servico
                return draft;
            });
        }
        default: return state;
    }
}

export default servico;