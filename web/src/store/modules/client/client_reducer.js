import produce from "immer";
import types from "./client_types";

const INITIAL_STATE = {
  comportamento: "create",
  componentes: {
    drawer: false,
    confirmDelete: false,
  },
  estadoFormulario: {
    filtering: false,
    disabled: false,
    saving: false,
    loadingClientes: false,
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
  filters: {
    page: 1,
    limit: 10,
    sortColumn: null,
    sortType: null,
    search: "",
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
  },
};

const clienteReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case types.UPDATE_CLIENTES: {
      return {
        ...state,
        ...action.payload,
        filters: action.payload.filters
          ? { ...state.filters, ...action.payload.filters }
          : state.filters,
        pagination: action.payload.pagination
          ? { ...state.pagination, ...action.payload.pagination }
          : state.pagination,
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
};

export default clienteReducer;
