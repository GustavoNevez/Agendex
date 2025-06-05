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
  const { estadoFormulario, filters } = yield select(
    (state) => state.profissional
  );

  try {
    yield put(
      updateProfissional({
        estadoFormulario: {
          ...estadoFormulario,
          filtering: true,
          loadingProfissionais: true,
        },
      })
    );

    const user = JSON.parse(localStorage.getItem("@Auth:user"));
    const params = new URLSearchParams({
      page: filters?.page || 1,
      limit: filters?.limit || 10,
      ...(filters?.sortColumn && { sortColumn: filters.sortColumn }),
      ...(filters?.sortType && { sortType: filters.sortType }),
      ...(filters?.search && { search: filters.search }),
    });

    const { data: response } = yield call(
      api.get,
      `/profissional/estabelecimento/${user.id}?${params}`
    );

    if (response.error) {
      showErrorToast(response.message);
      return false;
    }

    yield put(
      updateProfissional({
        profissionais: response.profissionais,
        pagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
        },
      })
    );
  } catch (err) {
    showErrorToast(err.message);
  } finally {
    yield put(
      updateProfissional({
        estadoFormulario: {
          ...estadoFormulario,
          filtering: false,
          loadingProfissionais: false,
        },
      })
    );
  }
}

export function* addProfissional() {
  const { estadoFormulario, profissional, componentes } = yield select(
    (state) => state.profissional
  );

  try {
    // Validate file type if there's a photo
    if (profissional.foto) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(profissional.foto.type)) {
        showErrorToast(
          "Tipo de arquivo inválido. Use apenas JPG, JPEG ou PNG."
        );
        return false;
      }
    }

    yield put(
      updateProfissional({
        estadoFormulario: { ...estadoFormulario, saving: true },
      })
    );

    const storedUser = localStorage.getItem("@Auth:user");
    const user = JSON.parse(storedUser);
    const estabelecimentoId = user.id;

    const formData = new FormData();

    // Adicionar a foto se existir
    if (profissional.foto) {
      formData.append("file", profissional.foto);
    }

    // Adicionar campos obrigatórios e opcionais
    formData.append("nome", profissional.nome);
    formData.append("email", profissional.email);
    formData.append("telefone", profissional.telefone || "");
    formData.append("especialidade", profissional.especialidade || "");
    formData.append("estabelecimentoId", estabelecimentoId);
    formData.append("customLink", profissional.customLink || "");
    formData.append("servicosId", JSON.stringify(profissional.servicosId));
    formData.append("status", profissional.status || "A");

    const { data: response } = yield call(
      api.post,
      `/profissional/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
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
  } finally {
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
    // Validate file type if there's a new photo
    if (profissional.foto instanceof File) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(profissional.foto.type)) {
        showErrorToast(
          "Tipo de arquivo inválido. Use apenas JPG, JPEG ou PNG."
        );
        return false;
      }
    }

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

    const formData = new FormData();

    // Add file if it's a new photo
    if (profissional.foto instanceof File) {
      formData.append("file", profissional.foto);
    }

    // Remove foto from data if it's a File or URL
    const dataToSend = {
      ...profissional,
      estabelecimentoId, // Add estabelecimentoId to the data object
    };

    if (
      dataToSend.foto instanceof File ||
      typeof dataToSend.foto === "string"
    ) {
      delete dataToSend.foto;
    }
    delete dataToSend.fotoPreview; // Remove preview if exists

    // Append professional data
    formData.append("data", JSON.stringify(dataToSend));

    const { data: response } = yield call(api.put, url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

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
  } finally {
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
