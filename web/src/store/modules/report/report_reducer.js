import types from "./report_types";
import produce from "immer";

const INITIAL_STATE = {
  relatorio: {
    numeroAgendamentos: 0,
    totalDinheiro: 0,
    agendamentos: [],
  },
  loading: false,
};

function relatorio(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.UPDATE_RELATORIO: {
      return produce(state, (draft) => {
        draft.relatorio = action.relatorio;
        draft.loading = false;
      });
    }
    case types.SET_LOADING: {
      return produce(state, (draft) => {
        draft.loading = action.loading;
      });
    }
    default:
      return state;
  }
}

export default relatorio;
