import types from "./report_types";

export const fetchRelatorio = (start, end) => ({
  type: types.FETCH_RELATORIO,
  start,
  end,
});

export const updateRelatorio = (relatorio) => ({
  type: types.UPDATE_RELATORIO,
  relatorio,
});

export const setLoading = (loading) => ({
  type: types.SET_LOADING,
  loading,
});
