import produce from "immer";
import types from "./professional_types";

const INITIAL_STATE = {
  comportamento: "create",
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
  profissionais: [],
  profissional: {
    estabelecimentoId: "",
    id: "",
    nome: "",
    email: "",
    telefone: "",
    especialidade: "",
    servicosId: [], // Array para armazenar IDs dos serviços vinculados
    status: "A",
    customLink: "", // Campo para link personalizado
  },
};

function profissional(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.UPDATE_PROFISSIONAL: {
      return produce(state, (draft) => {
        draft = { ...draft, ...action.payload };
        return draft;
      });
    }
    case types.RESET_PROFISSIONAL: {
      return produce(state, (draft) => {
        draft.profissional = INITIAL_STATE.profissional;
        return draft;
      });
    }
    default:
      return state;
  }
}

export default profissional;
