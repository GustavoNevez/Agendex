import { takeLatest, all, call, put, select } from "redux-saga/effects";
import {
  updateServico,
  allServicos as allServicosAction,
  resetServico,
} from "./service_actions";
import types from "./service_types";
import api from "../../../services/api";
import { showErrorToast, showSuccessToast } from "../../../utils/notifications";

export function* allServicos() {
  const { estadoFormulario } = yield select((state) => state.servico);

  try {
    const storedUser = localStorage.getItem("@Auth:user");
    const user = JSON.parse(storedUser);
    const estabelecimentoId = user.id;

    yield put(
      updateServico({
        estadoFormulario: { ...estadoFormulario, filtering: true },
      })
    );
    const { data: response } = yield call(
      api.get,
      `/servico/estabelecimento/${estabelecimentoId}`
    );
    yield put(
      updateServico({
        estadoFormulario: { ...estadoFormulario, filtering: false },
      })
    );

    if (response.error) {
      showErrorToast(response.message);
      return false;
    }
    yield put(updateServico({ servicos: response.servicos }));
  } catch (err) {
    showErrorToast(err.message);
    yield put(
      updateServico({
        estadoFormulario: { ...estadoFormulario, filtering: false },
      })
    );
  }
}

export function* addServico() {
  const { estadoFormulario, servico, componentes } = yield select(
    (state) => state.servico
  );

  try {
    yield put(
      updateServico({ estadoFormulario: { ...estadoFormulario, saving: true } })
    );

    const storedUser = localStorage.getItem("@Auth:user");
    const user = JSON.parse(storedUser);
    const estabelecimentoId = user.id;
    const servicoComEstabelecimento = { ...servico, estabelecimentoId };

    const { data: response } = yield call(
      api.post,
      `/servico/`,
      servicoComEstabelecimento
    );
    yield put(
      updateServico({
        estadoFormulario: { ...estadoFormulario, saving: false },
      })
    );

    if (response.error) {
      showErrorToast("Verifique todos os campos obrigatorios");
      return false;
    }

    yield put(allServicosAction());
    yield put(
      updateServico({ componentes: { ...componentes, drawer: false } })
    );
    yield put(resetServico());
    showSuccessToast("Serviço adicionado com sucesso!");
  } catch (err) {
    showErrorToast(err.message);
    yield put(
      updateServico({
        estadoFormulario: { ...estadoFormulario, saving: false },
      })
    );
  }
}

export function* removeServico() {
  const { estadoFormulario, servico, componentes } = yield select(
    (state) => state.servico
  );

  try {
    yield put(
      updateServico({ estadoFormulario: { ...estadoFormulario, saving: true } })
    );
    const { data: response } = yield call(
      api.delete,
      `/servico/remove/${servico.id}`,
      servico
    );
    yield put(
      updateServico({
        estadoFormulario: {
          ...estadoFormulario,
          saving: false,
          confirmDelete: false,
        },
      })
    );

    if (response.error) {
      showErrorToast(response.message);
      return false;
    }
    yield put(allServicosAction());
    yield put(
      updateServico({
        componentes: { ...componentes, drawer: false, confirmDelete: false },
      })
    );
    yield put(resetServico());
  } catch (err) {
    showErrorToast(err.message);
    yield put(
      updateServico({
        estadoFormulario: { ...estadoFormulario, filtering: false },
      })
    );
  }
}

export function* saveServicos() {
  const { estadoFormulario, servico, componentes } = yield select(
    (state) => state.servico
  );

  try {
    yield put(
      updateServico({ estadoFormulario: { ...estadoFormulario, saving: true } })
    );

    const storedUser = localStorage.getItem("@Auth:user");
    const user = JSON.parse(storedUser);
    const estabelecimentoId = user.id;
    const servicoId = servico.id;
    const url = `/servico/${servicoId}/${estabelecimentoId}`;

    const { data: response } = yield call(api.put, url, servico);
    yield put(
      updateServico({
        estadoFormulario: { ...estadoFormulario, saving: false },
      })
    );

    if (response.error) {
      showErrorToast(response.message);
      return false;
    }
    yield put(allServicosAction());
    yield put(
      updateServico({
        componentes: { ...componentes, drawer: false, confirmUpdate: false },
      })
    );
    yield put(resetServico());
  } catch (err) {
    showErrorToast(err.message);
    yield put(
      updateServico({
        estadoFormulario: { ...estadoFormulario, saving: false },
      })
    );
  }
}

export default all([
  takeLatest(types.ALL_SERVICOS, allServicos),
  takeLatest(types.ADD_SERVICOS, addServico),
  takeLatest(types.REMOVE_SERVICOS, removeServico),
  takeLatest(types.SAVE_SERVICOS, saveServicos),
]);
