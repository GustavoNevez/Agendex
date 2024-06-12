import types from './types'

export function allClientes() {
    return {type: types.ALL_CLIENTES};
}

export function updateClientes(payload) {
    return {type: types.UPDATE_CLIENTES, payload};
}

export function filterCliente() {
    return {type: types.FILTER_CLIENTES};
}

export function addCliente() {
    return {type: types.ADD_CLIENTE};
}

export function resetCliente() {
    return {type: types.RESET_CLIENTE};
}

export function unlinkCliente() {
    return {type: types.UNLINK_CLIENTE};
}
