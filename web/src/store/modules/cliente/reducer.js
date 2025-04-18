import produce from 'immer';
import types from './types';

const INITIAL_STATE = {
    comportamento:'create',
    componentes:{
        drawer:false,
        confirmDelete:false
    },
    estadoFormulario:{
        filtereing:false,
        disabled:false,
        saving:false,
    },
    clientes: [],
    cliente: {
        nome:'',
        email:'',
        telefone:'',
        documento: {
            tipo:'cpf',
            numero:'',
        },
        endereco:{
            cep:'',
            uf:'',
            cidade:'',
            bairro:'',
            rua:'',
            numero:'',

        }
    }
};

function cliente(state = INITIAL_STATE, action) {
    switch(action.type) {
        case types.UPDATE_CLIENTES: {
            return produce(state, (draft) => {
                
                draft =  { ...draft, ...action.payload};
                return draft;
            });     
        }
        case types.RESET_CLIENTE: {
            return produce(state, (draft) => {
                
                draft.cliente = INITIAL_STATE.cliente
                return draft;
            });
        }
        default: return state;
    }
}

export default cliente;