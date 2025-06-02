import types from "./professional_types";

export function allProfissionais() {
  return { type: types.ALL_PROFISSIONAIS };
}

export function updateProfissional(payload) {
  return { type: types.UPDATE_PROFISSIONAL, payload };
}

export function addProfissional() {
  return { type: types.ADD_PROFISSIONAL };
}

export function resetProfissional() {
  return { type: types.RESET_PROFISSIONAL };
}

export function removeProfissional() {
  return { type: types.REMOVE_PROFISSIONAL };
}

export function saveProfissional() {
  return { type: types.SAVE_PROFISSIONAL };
}
