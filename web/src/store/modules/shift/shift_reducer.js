// src/store/modules/turno/reducer.js
import types from "./shift_types";

const INITIAL_STATE = {
  turnos: [],
};

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case types.UPDATE_TURNOS:
      return {
        ...state,
        turnos: action.turnos,
      };

    case types.SAVE_TURNO_SUCCESS:
      return {
        ...state,
        turnos: [...state.turnos, action.turno],
      };

    case types.UPDATE_TURNO_SUCCESS:
      return {
        ...state,
        turnos: state.turnos.map((turno) =>
          turno._id === action.turno._id ? action.turno : turno
        ),
      };

    case types.DELETE_TURNO_SUCCESS:
      return {
        ...state,
        turnos: state.turnos.filter((turno) => turno._id !== action.id),
      };

    case types.TOGGLE_TURNO_STATUS_SUCCESS:
      return {
        ...state,
        turnos: state.turnos.map((turno) =>
          turno._id === action.id ? { ...turno, status: action.status } : turno
        ),
      };

    default:
      return state;
  }
};

export default reducer;
