import types from './types'

export function allServicos() {
    return {type: types.ALL_SERVICOS};
}

export function updateServico(payload) {
    return {type: types.UPDATE_SERVICOS, payload};
}


export function addServico() {
    return {type: types.ADD_SERVICOS};
}

export function resetServico() {
    return {type: types.RESET_SERVICOS};
}

export function removeServico() {
    return {type: types.REMOVE_SERVICOS};
}

export function saveServicos() {
    return {type: types.SAVE_SERVICOS};
}