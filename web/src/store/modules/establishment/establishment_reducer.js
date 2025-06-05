import types from "./establishment_types";

const INITIAL_STATE = {
  data: {
    nome: "",
    email: "",
    telefone: "",
    customLink: "",
    foto: "",
  },
  loading: false,
  saving: false,
};

const establishmentReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case types.UPDATE_ESTABLISHMENT:
      return {
        ...state,
        data: { ...state.data, ...action.payload },
      };
    case types.SET_ESTABLISHMENT_LOADING:
      return {
        ...state,
        loading: action.loading,
      };
    case types.SET_ESTABLISHMENT_SAVING:
      return {
        ...state,
        saving: action.saving,
      };
    case types.RESET_ESTABLISHMENT:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default establishmentReducer;
