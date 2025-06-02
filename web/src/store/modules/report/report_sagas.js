import { all, takeLatest, call, put } from "redux-saga/effects";
import api from "../../../services/api";
import types from "./report_types";
import { updateRelatorio } from "./report_actions";
import { showErrorToast } from "../../../utils/notifications";

export function* fetchRelatorio({ start, end }) {
  try {
    const storedUser = localStorage.getItem("@Auth:user");
    const user = JSON.parse(storedUser);
    const estabelecimentoId = user.id;
    const { data: response } = yield call(api.post, "/agendamento/relatorio", {
      estabelecimentoId,
      periodo: {
        inicio: start,
        final: end,
      },
    });
    if (response.error) {
      showErrorToast(response.message);
      return false;
    }
    console.log(response);
    yield put(updateRelatorio(response.relatorio));
    console.log(response.relatorio);
  } catch (err) {
    showErrorToast(err.message);
  }
}
export default all([takeLatest(types.FETCH_RELATORIO, fetchRelatorio)]);
