// src/store/modules/turno/actions.js
import types from './types';

/**
 * Update turnos in the store
 * @param {Array} turnos - Array of turno objects
 */
export const updateTurnos = (turnos) => ({
    type: types.UPDATE_TURNOS,
    turnos,
});

/**
 * Fetch turnos for an establishment
 */
export const fetchTurnos = () => ({
    type: types.FETCH_TURNOS,
});

/**
 * Save a new turno
 * @param {Object} turno - Turno data
 */
export const saveTurno = (turno) => ({
    type: types.SAVE_TURNO,
    turno,
});

/**
 * Successfully saved a turno
 * @param {Object} turno - Saved turno with ID
 */
export const saveTurnoSuccess = (turno) => ({
    type: types.SAVE_TURNO_SUCCESS,
    turno,
});

/**
 * Update an existing turno
 * @param {Object} turno - Turno data with ID
 */
export const updateTurno = (turno) => ({
    type: types.UPDATE_TURNO,
    turno,
});

/**
 * Successfully updated a turno
 * @param {Object} turno - Updated turno data
 */
export const updateTurnoSuccess = (turno) => ({
    type: types.UPDATE_TURNO_SUCCESS,
    turno,
});

/**
 * Delete a turno
 * @param {String} id - Turno ID
 */
export const deleteTurno = (id) => ({
    type: types.DELETE_TURNO,
    id,
});

/**
 * Successfully deleted a turno
 * @param {String} id - Deleted turno ID
 */
export const deleteTurnoSuccess = (id) => ({
    type: types.DELETE_TURNO_SUCCESS,
    id,
});

/**
 * Activate a turno
 * @param {String} id - Turno ID
 */
export const activateTurno = (id) => ({
    type: types.ACTIVATE_TURNO,
    id,
});

/**
 * Deactivate a turno
 * @param {String} id - Turno ID
 */
export const deactivateTurno = (id) => ({
    type: types.DEACTIVATE_TURNO,
    id,
});

/**
 * Successfully toggled a turno's status
 * @param {String} id - Turno ID
 * @param {String} status - New status
 */
export const toggleTurnoStatusSuccess = (id, status) => ({
    type: types.TOGGLE_TURNO_STATUS_SUCCESS,
    id,
    status,
});