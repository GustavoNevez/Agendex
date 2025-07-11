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
  const { estadoFormulario, filters } = yield select((state) => state.servico);

  try {
    const storedUser = localStorage.getItem("@Auth:user");
    const user = JSON.parse(storedUser);
    const estabelecimentoId = user.id;

    yield put(
      updateServico({
        estadoFormulario: { ...estadoFormulario, filtering: true },
      })
    );

    const params = new URLSearchParams({
      page: filters?.page || 1,
      limit: filters?.limit || 10,
      ...(filters?.sortColumn && { sortColumn: filters.sortColumn }),
      ...(filters?.sortType && { sortType: filters.sortType }),
      ...(filters?.search && { search: filters.search }),
    });

    const { data: response } = yield call(
      api.get,
      `/servico/estabelecimento/${estabelecimentoId}?${params}`
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
    yield put(
      updateServico({
        servicos: response.servicos,
        pagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
        },
      })
    );
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

    // Novo: usar FormData para foto
    const formData = new FormData();
    if (servico.foto instanceof File) {
      formData.append("file", servico.foto);
    }
    formData.append("titulo", servico.titulo);
    formData.append("preco", servico.preco);
    formData.append("recorrencia", servico.recorrencia);
    formData.append("duracao", servico.duracao);
    formData.append("status", servico.status || "A");
    formData.append("descricao", servico.descricao || "");
    formData.append("estabelecimentoId", estabelecimentoId);
    // NOVO: adicionar vagasPorHorario
    formData.append("vagasPorHorario", servico.vagasPorHorario || 1);

    const { data: response } = yield call(api.post, `/servico/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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

    // Novo: usar FormData para foto
    const formData = new FormData();
    if (servico.foto instanceof File) {
      formData.append("file", servico.foto);
    }

    // Remove foto do objeto para não duplicar
    const dataToSend = { ...servico, estabelecimentoId };
    if (
      dataToSend.foto instanceof File ||
      typeof dataToSend.foto === "string"
    ) {
      delete dataToSend.foto;
    }
    delete dataToSend.fotoPreview;

    // NOVO: garantir vagasPorHorario está presente
    if (!dataToSend.vagasPorHorario) {
      dataToSend.vagasPorHorario = 1;
    }

    formData.append("data", JSON.stringify(dataToSend));

    const { data: response } = yield call(api.put, url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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
