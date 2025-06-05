import produce from "immer";
import types from "./professional_types";

const INITIAL_STATE = {
  profissional: {
    estabelecimentoId: "",
    id: "",
    nome: "",
    email: "",
    telefone: "",
    especialidade: "",
    servicosId: [],
    status: "A",
    customLink: "",
    foto: "",
  },
  profissionais: [],
  componentes: {
    drawer: false,
    confirmDelete: false,
    confirmUpdate: false,
  },
  estadoFormulario: {
    filtering: false,
    disabled: true,
    saving: false,
    loadingFoto: false,
    loadingServicos: false,
    loadingProfissionais: false,
  },
  comportamento: "create",
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

const profissionalReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case "@profissional/UPDATE_PROFISSIONAL": {
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

    case "@profissional/RESET_PROFISSIONAL":
      return {
        ...state,
        profissional: INITIAL_STATE.profissional,
        comportamento: action.payload?.comportamento || "create",
      };

    default:
      return state;
  }
};

export default profissionalReducer;
