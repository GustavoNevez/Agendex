import produce from 'immer';
import types from './types';

const INITIAL_STATE = {
    publicData: {
        estabelecimento: null,
        profissional: null,
        servicos: [],
        profissionais: [],
        registrationStatus: { // Removi este, pois você tem clientRegistration fora
            step: 1,
            success: false,
            data: null
        }
    },
    availability: [],
    appointments: [],
    clientAppointments: [],
    clientRegistration: {
        step: 1, // 1: Registration, 2: Verification, 3: Completed
        success: false,
        data: null, // Store user data during registration
        clientData: null // Store final client data after verification
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
            console.log('Reducer UPDATE_CLIENT_REGISTRATION payload:', action.payload);
            return produce(state, (draft) => {
                draft.clientRegistration = { ...action.payload };
                draft.loading = false;
            });
        }
        default:
            return state;
    }
}

export default publicReducer;