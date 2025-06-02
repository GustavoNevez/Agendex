import { takeLatest, all, call, put, select } from "redux-saga/effects";
import {
  updateProfissional,
  allProfissionais as allProfissionaisAction,
  resetProfissional,
} from "./professional_actions";
import types from "./professional_types";
import api from "../../../services/api";
import { showErrorToast, showSuccessToast } from "../../../utils/notifications";

export function* allProfissionais() {
  const { estadoFormulario } = yield select((state) => state.profissional);

  try {
    const storedUser = localStorage.getItem("@Auth:user");
    const user = JSON.parse(storedUser);
    const estabelecimentoId = user.id;

    yield put(
      updateProfissional({
        estadoFormulario: { ...estadoFormulario, filtering: true },
      })
    );
    const { data: response } = yield call(
      api.get,
      `/profissional/estabelecimento/${estabelecimentoId}`
    );
    yield put(
      updateProfissional({
        estadoFormulario: { ...estadoFormulario, filtering: false },
      })
    );

    if (response.error) {
      showErrorToast(response.message);
      return false;
    }
    yield put(updateProfissional({ profissionais: response.profissionais }));
  } catch (err) {
    showErrorToast(err.message);
    yield put(
      updateProfissional({
        estadoFormulario: { ...estadoFormulario, filtering: false },
      })
    );
  }
}

export function* addProfissional() {
  const { estadoFormulario, profissional, componentes } = yield select(
    (state) => state.profissional
  );

  try {
    yield put(
      updateProfissional({
        estadoFormulario: { ...estadoFormulario, saving: true },
      })
    );

    const storedUser = localStorage.getItem("@Auth:user");
    const user = JSON.parse(storedUser);
    const estabelecimentoId = user.id;
    const profissionalComEstabelecimento = {
      ...profissional,
      estabelecimentoId,
    };

    const { data: response } = yield call(
      api.post,
      `/profissional/`,
      profissionalComEstabelecimento
    );
    yield put(
      updateProfissional({
        estadoFormulario: { ...estadoFormulario, saving: false },
      })
    );

    if (response.error) {
      showErrorToast(
        response.message || "Verifique todos os campos obrigatórios"
      );
      return false;
    }

    yield put(allProfissionaisAction());
    yield put(
      updateProfissional({ componentes: { ...componentes, drawer: false } })
    );
    yield put(resetProfissional());
    showSuccessToast("Profissional adicionado com sucesso!");
  } catch (err) {
    showErrorToast(err.message);
    yield put(
      updateProfissional({
        estadoFormulario: { ...estadoFormulario, saving: false },
      })
    );
  }
}

export function* removeProfissional() {
  const { estadoFormulario, profissional, componentes } = yield select(
    (state) => state.profissional
  );

  try {
    yield put(
      updateProfissional({
        estadoFormulario: { ...estadoFormulario, saving: true },
      })
    );
    const { data: response } = yield call(
      api.delete,
      `/profissional/remove/${profissional.id}`
    );
    yield put(
      updateProfissional({
        estadoFormulario: { ...estadoFormulario, saving: false },
      })
    );

    if (response.error) {
      showErrorToast(response.message);
      return false;
    }
    yield put(allProfissionaisAction());
    yield put(
      updateProfissional({
        componentes: { ...componentes, drawer: false, confirmDelete: false },
      })
    );
    yield put(resetProfissional());
    showSuccessToast("Profissional removido com sucesso!");
  } catch (err) {
    showErrorToast(err.message);
    yield put(
      updateProfissional({
        estadoFormulario: { ...estadoFormulario, saving: false },
      })
    );
  }
}

export function* saveProfissional() {
  const { estadoFormulario, profissional, componentes } = yield select(
    (state) => state.profissional
  );

  try {
    yield put(
      updateProfissional({
        estadoFormulario: { ...estadoFormulario, saving: true },
      })
    );

    const storedUser = localStorage.getItem("@Auth:user");
    const user = JSON.parse(storedUser);
    const estabelecimentoId = user.id;
    const profissionalId = profissional.id;
    const url = `/profissional/${profissionalId}/${estabelecimentoId}`;

    const { data: response } = yield call(api.put, url, profissional);
    yield put(
      updateProfissional({
        estadoFormulario: { ...estadoFormulario, saving: false },
      })
    );

    if (response.error) {
      showErrorToast(response.message);
      return false;
    }
    yield put(allProfissionaisAction());
    yield put(
      updateProfissional({
        componentes: { ...componentes, drawer: false, confirmUpdate: false },
      })
    );
    yield put(resetProfissional());
    showSuccessToast("Profissional atualizado com sucesso!");
  } catch (err) {
    showErrorToast(err.message);
    yield put(
      updateProfissional({
        estadoFormulario: { ...estadoFormulario, saving: false },
      })
    );
  }
}

export default all([
  takeLatest(types.ALL_PROFISSIONAIS, allProfissionais),
  takeLatest(types.ADD_PROFISSIONAL, addProfissional),
  takeLatest(types.REMOVE_PROFISSIONAL, removeProfissional),
  takeLatest(types.SAVE_PROFISSIONAL, saveProfissional),
]);
