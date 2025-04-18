import moment from 'moment';

/**
 * Filter available times based on business hours (turnos)
 * 
 * @param {Array} availableTimes - Array of available time slots in HH:mm format
 * @param {Date} selectedDate - The selected date
 * @param {Array} turnos - Array of turno objects with dias, inicio, and fim properties
 * @returns {Array} - Filtered array of available times that fall within business hours
 */
export const filterTimesByBusinessHours = (availableTimes, selectedDate, turnos) => {
  if (!availableTimes || !availableTimes.length || !turnos || !turnos.length) {
    return availableTimes;
  }

  // Get day of week for the selected date (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = moment(selectedDate).day();
  
  // Filter turnos for active ones that include this day of week
  const activeTurnos = turnos.filter(turno => 
    turno.status === 'A' && turno.dias.includes(dayOfWeek)
  );
  
  if (activeTurnos.length === 0) {
    // If no active turnos for this day, return empty array (no available times)
    return [];
  }
  
  // Filter available times to those within any of the active turnos
  return availableTimes.filter(timeStr => {
    // Create moment object for this time on the selected date
    const [hours, minutes] = timeStr.split(':').map(Number);
    const timeWithDate = moment(selectedDate).set({
      hour: hours,
      minute: minutes,
      second: 0,
      millisecond: 0
    });
    
    // Check if time falls within any of the active turnos
    return activeTurnos.some(turno => {
      // Extract start and end hours/minutes
      const inicioMoment = moment(turno.inicio);
      const fimMoment = moment(turno.fim);
      
      // Create moments for start and end time on the selected date
      const turnoInicio = moment(selectedDate).set({
        hour: inicioMoment.hour(),
        minute: inicioMoment.minute(),
        second: 0,
        millisecond: 0
      });
      
      const turnoFim = moment(selectedDate).set({
        hour: fimMoment.hour(),
        minute: fimMoment.minute(),
        second: 0,
        millisecond: 0
      });
      
      // Check if time is within this turno's hours
      return timeWithDate.isBetween(turnoInicio, turnoFim, null, '[)');
    });
  });
};

/**
 * Gets the next available time slot considering business hours
 * 
 * @param {Array} availableTimes - Array of available time slots in HH:mm format
 * @param {Date} selectedDate - The selected date
 * @param {Array} turnos - Array of turno objects
 * @returns {String|null} - Next available time slot or null if none available
 */
export const getNextAvailableTime = (availableTimes, selectedDate, turnos) => {
  const filteredTimes = filterTimesByBusinessHours(availableTimes, selectedDate, turnos);
  return filteredTimes.length > 0 ? filteredTimes[0] : null;
};

export default {
  filterTimesByBusinessHours,
  getNextAvailableTime
};