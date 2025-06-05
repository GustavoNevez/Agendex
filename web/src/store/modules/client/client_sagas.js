import { takeLatest, all, call, put, select } from "redux-saga/effects";
import {
  updateClientes,
  allClientes as allClienteAction,
  resetCliente,
} from "./client_actions";
import types from "./client_types";
import api from "../../../services/api";
import { showSuccessToast, showErrorToast } from "../../../utils/notifications";

export function* allClientes() {
  const { estadoFormulario, filters } = yield select((state) => state.clientes);

  try {
    yield put(
      updateClientes({
        estadoFormulario: {
          ...estadoFormulario,
          filtering: true,
          loadingClientes: true,
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
      `/cliente/clientes/${user.id}?${params}`
    );

    if (response.error) {
      showErrorToast(response.message);
      return false;
    }

    yield put(
      updateClientes({
        clientes: response.clientes,
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
      updateClientes({
        estadoFormulario: {
          ...estadoFormulario,
          filtering: false,
          loadingClientes: false,
        },
      })
    );
  }
}

export function* filterClientes() {
  const { estadoFormulario, cliente } = yield select((state) => state.clientes);

  try {
    yield put(
      updateClientes({
        estadoFormulario: { ...estadoFormulario, filtering: true },
      })
    );
    const { data: response } = yield call(api.post, `/cliente/filter`, {
      filters: { email: cliente.email },
    });
    yield put(
      updateClientes({
        estadoFormulario: { ...estadoFormulario, filtering: false },
      })
    );

    if (response.clientes.length > 0) {
      yield put(
        updateClientes({
          estadoFormulario: {
            ...estadoFormulario,
            filtering: false,
            disabled: true,
          },
        })
      );

      showErrorToast("Email ja cadastrado, insira outro email valido!");
    } else {
      yield put(
        updateClientes({
          estadoFormulario: { ...estadoFormulario, disabled: false },
        })
      );
    }
    yield put(updateClientes({ clientes: response.clientes }));
  } catch (err) {
    showErrorToast(err.message);
    yield put(
      updateClientes({
        estadoFormulario: { ...estadoFormulario, filtering: false },
      })
    );
  }
}

export function* addCliente() {
  const { estadoFormulario, cliente, componentes } = yield select(
    (state) => state.clientes
  );

  try {
    const storedUser = localStorage.getItem("@Auth:user");
    const user = JSON.parse(storedUser);
    const estabelecimentoId = user.id;
    const clienteComEstabelecimento = { ...cliente, estabelecimentoId };

    yield put(
      updateClientes({
        estadoFormulario: { ...estadoFormulario, saving: true },
      })
    );
    const { data: response } = yield call(
      api.post,
      `/cliente/`,
      clienteComEstabelecimento
    );
    yield put(
      updateClientes({
        estadoFormulario: { ...estadoFormulario, saving: false },
      })
    );

    if (response.error) {
      showErrorToast(response.message);
      return false;
    }

    yield put(allClienteAction());
    yield put(
      updateClientes({ componentes: { ...componentes, drawer: false } })
    );
    yield put(
      updateClientes({
        estadoFormulario: {
          ...estadoFormulario,
          filtering: false,
          disabled: true,
        },
      })
    );
    yield put(resetCliente());
    showSuccessToast("Cliente adicionado com sucesso!");
  } catch (err) {
    showErrorToast(err.message);
    yield put(
      updateClientes({
        estadoFormulario: { ...estadoFormulario, saving: false },
      })
    );
  }
}

export function* unlinkCliente() {
  const { estadoFormulario, cliente, componentes } = yield select(
    (state) => state.clientes
  );

  try {
    yield put(
      updateClientes({
        estadoFormulario: { ...estadoFormulario, saving: true },
      })
    );
    const { data: response } = yield call(
      api.delete,
      `/cliente/delete/${cliente.id}`,
      cliente
    );
    yield put(
      updateClientes({
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
    yield put(allClienteAction());
    yield put(
      updateClientes({
        componentes: { ...componentes, drawer: false, confirmDelete: false },
      })
    );
    yield put(resetCliente());
  } catch (err) {
    showErrorToast(err.message);
    yield put(
      updateClientes({
        estadoFormulario: { ...estadoFormulario, filtering: false },
      })
    );
  }
}

export default all([
  takeLatest(types.ALL_CLIENTES, allClientes),
  takeLatest(types.FILTER_CLIENTES, filterClientes),
  takeLatest(types.ADD_CLIENTE, addCliente),
  takeLatest(types.UNLINK_CLIENTE, unlinkCliente),
]);
