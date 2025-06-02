import types from "./service_types";

export function allServicos() {
  return { type: types.ALL_SERVICOS };
}

export const updateServico = (payload) => ({
  type: "@servico/UPDATE_SERVICO",
  payload: { ...payload },
});

export const addServico = () => ({
  type: "@servico/ADD_SERVICO",
});

export const resetServico = (payload) => ({
  type: "@servico/RESET_SERVICO",
  payload: payload ? { ...payload } : undefined,
});

export function removeServico() {
  return { type: types.REMOVE_SERVICOS };
}

export function saveServicos() {
  return { type: types.SAVE_SERVICOS };
}
