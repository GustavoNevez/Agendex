import types from './types';

export const fetchPublicData = (customLink, type) => ({
    type: types.FETCH_PUBLIC_DATA,
    customLink,
    dataType: type,
});

export const updatePublicData = (payload) => ({
    type: types.UPDATE_PUBLIC_DATA,
    payload,
});

export const checkAvailability = (availabilityData) => ({
    type: types.CHECK_AVAILABILITY,
    availabilityData,
});

export const updateAvailability = (horariosDisponiveis) => ({
    type: types.UPDATE_AVAILABILITY,
    horariosDisponiveis,
});

export const createAppointment = (appointmentData) => ({
    type: types.CREATE_APPOINTMENT,
    appointmentData,
});

export const updateAppointment = (appointment) => ({
    type: types.UPDATE_APPOINTMENT,
    appointment,
});

export const fetchClientAppointments = (clientData) => ({
    type: types.FETCH_CLIENT_APPOINTMENTS,
    clientData,
});

export const updateClientAppointments = (appointments) => ({
    type: types.UPDATE_CLIENT_APPOINTMENTS,
    appointments,
});

export const registerClient = (clientData) => ({
    type: types.REGISTER_CLIENT,
    clientData,
});

export const verifyClient = (verificationData) => ({
    type: types.VERIFY_CLIENT,
    verificationData,
});

export function updateClientRegistration(payload) {
    return { type: types.UPDATE_CLIENT_REGISTRATION, payload };
}
