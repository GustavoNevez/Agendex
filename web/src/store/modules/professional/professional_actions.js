import types from "./professional_types";

export function allProfissionais() {
  return { type: types.ALL_PROFISSIONAIS };
}

export const updateProfissional = (payload) => ({
  type: "@profissional/UPDATE_PROFISSIONAL",
  payload: { ...payload },
});

export const resetProfissional = (payload) => ({
  type: "@profissional/RESET_PROFISSIONAL",
  payload: payload ? { ...payload } : undefined,
});

export function addProfissional() {
  return { type: types.ADD_PROFISSIONAL };
}

export function removeProfissional() {
  return { type: types.REMOVE_PROFISSIONAL };
}

export function saveProfissional() {
  return { type: types.SAVE_PROFISSIONAL };
}
