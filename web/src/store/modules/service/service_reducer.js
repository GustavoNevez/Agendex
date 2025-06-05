const INITIAL_STATE = {
  servico: {
    titulo: "",
    preco: "",
    recorrencia: "",
    duracao: "",
    status: "A",
    descricao: "",
  },
  servicos: [],
  componentes: {
    drawer: false,
    confirmDelete: false,
    confirmUpdate: false,
  },
  estadoFormulario: {
    saving: false,
    filtering: false,
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

const servicoReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case "@servico/UPDATE_SERVICO":
      return {
        ...state,
        ...action.payload,
        servico: {
          ...state.servico,
          ...action.payload.servico,
        },
        componentes: {
          ...state.componentes,
          ...action.payload.componentes,
        },
        filters: action.payload.filters
          ? { ...state.filters, ...action.payload.filters }
          : state.filters,
        pagination: action.payload.pagination
          ? { ...state.pagination, ...action.payload.pagination }
          : state.pagination,
      };

    case "@servico/RESET_SERVICO":
      return {
        ...state,
        servico: INITIAL_STATE.servico,
        comportamento: action.payload?.comportamento || "create",
      };

    default:
      return state;
  }
};

export default servicoReducer;
