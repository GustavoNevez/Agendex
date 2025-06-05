import types from "./establishment_types";

export const fetchEstablishment = () => ({
  type: types.FETCH_ESTABLISHMENT,
});

export const updateEstablishment = (payload) => ({
  type: types.UPDATE_ESTABLISHMENT,
  payload,
});

export const saveEstablishment = (data) => ({
  type: types.SAVE_ESTABLISHMENT,
  data,
});

export const setEstablishmentLoading = (loading) => ({
  type: types.SET_ESTABLISHMENT_LOADING,
  loading,
});

export const setEstablishmentSaving = (saving) => ({
  type: types.SET_ESTABLISHMENT_SAVING,
  saving,
});

export const resetEstablishment = () => ({
  type: types.RESET_ESTABLISHMENT,
});
