import { takeLatest, call, put, all } from "redux-saga/effects";
import types from "./establishment_types";
import api from "../../../services/api";
import {
  updateEstablishment,
  setEstablishmentLoading,
  setEstablishmentSaving,
} from "./establishment_actions";
import { showSuccessToast, showErrorToast } from "../../../utils/notifications";

function* fetchEstablishmentSaga() {
  try {
    yield put(setEstablishmentLoading(true));
    const storedUser = localStorage.getItem("@Auth:user");
    const user = JSON.parse(storedUser);
    if (!user?.id) throw new Error("Usuário não autenticado");
    const { data } = yield call(api.get, `/estabelecimento/${user.id}`);
    if (!data.error && data.estabelecimento) {
      yield put(updateEstablishment(data.estabelecimento));
    } else {
      showErrorToast(data.message || "Erro ao buscar dados do estabelecimento");
    }
  } catch (err) {
    showErrorToast("Erro ao buscar dados do estabelecimento");
  } finally {
    yield put(setEstablishmentLoading(false));
  }
}

function* saveEstablishmentSaga(action) {
  try {
    yield put(setEstablishmentSaving(true));
    const storedUser = localStorage.getItem("@Auth:user");
    const user = JSON.parse(storedUser);
    if (!user?.id) throw new Error("Usuário não autenticado");

    const { nome, email, telefone, customLink, foto, endereco } = action.data;
    let fotoUrl = foto;

    // Se for arquivo, faz upload junto com os dados (FormData)
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("telefone", telefone || "");
    formData.append("customLink", customLink || "");
    // Adiciona o campo endereco (string JSON)
    if (endereco) {
      formData.append("endereco", endereco);
    }
    if (foto instanceof File) {
      formData.append("file", foto);
    }

    const { data } = yield call(
      api.put,
      `/estabelecimento/${user.id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!data.error) {
      // Se o backend retornar a nova foto, atualize no store
      let updatePayload = { ...action.data };
      if (data.foto) updatePayload.foto = data.foto;
      yield put(updateEstablishment(updatePayload));
      showSuccessToast("Dados atualizados com sucesso!");
    } else {
      showErrorToast(data.message || "Erro ao salvar dados");
    }
  } catch (err) {
    showErrorToast("Erro ao salvar dados");
  } finally {
    yield put(setEstablishmentSaving(false));
  }
}

export default all([
  takeLatest(types.FETCH_ESTABLISHMENT, fetchEstablishmentSaga),
  takeLatest(types.SAVE_ESTABLISHMENT, saveEstablishmentSaga),
]);
