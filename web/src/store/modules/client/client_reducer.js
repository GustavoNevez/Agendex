import types from "./client_types";

const INITIAL_STATE = {
  comportamento: "create",
  componentes: {
    drawer: false,
    confirmDelete: false,
  },
  estadoFormulario: {
    filtereing: false,
    disabled: false,
    saving: false,
  },
  clientes: [],
  cliente: {
    nome: "",
    email: "",
    telefone: "",
    documento: {
      tipo: "cpf",
      numero: "",
    },
    endereco: {
      cep: "",
      uf: "",
      cidade: "",
      bairro: "",
      rua: "",
      numero: "",
    },
  },
};

function cliente(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.UPDATE_CLIENTES: {
      return {
        ...state,
        ...action.payload,
        cliente: {
          ...state.cliente,
          ...action.payload.cliente,
        },
        componentes: {
          ...state.componentes,
          ...action.payload.componentes,
        },
      };
    }
    case types.RESET_CLIENTE: {
      return {
        ...state,
        cliente: INITIAL_STATE.cliente,
        comportamento: action.payload?.comportamento || "create",
      };
    }
    default:
      return state;
  }
}

export default cliente;
