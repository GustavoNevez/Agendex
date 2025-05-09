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
        default:
            return state;
    }
}

export default publicReducer;
