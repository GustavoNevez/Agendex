import produce from 'immer';
import types from './types';

const INITIAL_STATE = {
    publicData: {
        estabelecimento: null,
        profissional: null,
        servicos: [],
        profissionais: [],
    },
    availability: [],
    appointments: [],
    clientAppointments: [],
    lastAppointmentCreated: null,
    appointmentCreationSuccess: false,
    appointmentCreationError: null,
    clientRegistration: {
        step: 1,
        success: false,
        data: null,
        clientData: null,
        userToken: false
    },
    loading: false,
    horariosDisponiveis: [],
};

function publicReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case types.UPDATE_PUBLIC_DATA: {
            return produce(state, (draft) => {
                draft.publicData = action.payload;
                draft.loading = false;
            });
        }
        case types.UPDATE_AVAILABILITY: {
            return produce(state, (draft) => {
                draft.availability = action.horariosDisponiveis;
                draft.loading = false;
            });
        }
        case types.UPDATE_APPOINTMENT: {
            return produce(state, (draft) => {
                draft.appointments.push(action.appointment);
                draft.loading = false;
            });
        }
        case types.UPDATE_CLIENT_APPOINTMENTS: {
            return produce(state, (draft) => {
                draft.clientAppointments = action.appointments;
                draft.loading = false;
            });
        }
        case types.UPDATE_CLIENT_REGISTRATION: {
            return produce(state, (draft) => {
                draft.clientRegistration = {
                    ...draft.clientRegistration,
                    ...action.payload
                };
                draft.loading = false;
            });
        }
        case types.CREATE_APPOINTMENT_SUCCESS: {
            return produce(state, (draft) => {

                draft.lastAppointmentCreated = action.appointment;
                draft.appointmentCreationSuccess = true;
                draft.appointmentCreationError = null;
                draft.loading = false;
            });
        }
        case types.CREATE_APPOINTMENT_ERROR: {
            return produce(state, (draft) => {
                draft.appointmentCreationSuccess = false;
                draft.appointmentCreationError = action.error;
                draft.lastAppointmentCreated = null;
                draft.loading = false;
            });
        }
        case types.RESET_APPOINTMENT_SUCCESS: {
            return produce(state, (draft) => {
                draft.lastAppointmentCreated = null;
                draft.appointmentCreationSuccess = false;
                draft.appointmentCreationError = null;
            });
        }
        default:
            return state;
    }
}

export default publicReducer;