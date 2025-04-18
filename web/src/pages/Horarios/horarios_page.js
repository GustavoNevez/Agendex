import React, { useState, useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Toggle, Icon, Button, SelectPicker, DatePicker, Modal } from 'rsuite';
import { fetchTurnos, updateTurno, saveTurno, deleteTurno, activateTurno, deactivateTurno } from '../../store/modules/turno/actions';
import { AuthContext } from '../../context/auth';
import api from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../utils/notifications';
import './styles.css';

// Array of days for the schedule
const daysOfWeek = [
  { label: 'Domingo', value: 0 },
  { label: 'Segunda-feira', value: 1 },
  { label: 'Terça-feira', value: 2 },
  { label: 'Quarta-feira', value: 3 },
  { label: 'Quinta-feira', value: 4 },
  { label: 'Sexta-feira', value: 5 },
  { label: 'Sábado', value: 6 }
];

const Horarios = () => {
  const dispatch = useDispatch();
  // Use AuthContext directly
  const { user } = useContext(AuthContext);
  const { turnos = [] } = useSelector((state) => state.turno);
  const [loading, setLoading] = useState(false);
  const [savingDay, setSavingDay] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [intervalMinutes] = useState(30); // Fixed 30 minute intervals as per requirement
  
  // Turnos management
  const [showTurnoModal, setShowTurnoModal] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState(null);
  const [turnoName, setTurnoName] = useState('');
  const [turnoStartTime, setTurnoStartTime] = useState('08:00');
  const [turnoEndTime, setTurnoEndTime] = useState('12:00');
  const [turnoDays, setTurnoDays] = useState([]);
  const [turnoStatus, setTurnoStatus] = useState('A');
  
  // Schedule state for each day
  const [daySchedules, setDaySchedules] = useState({
    0: { enabled: false, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
    1: { enabled: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
    2: { enabled: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
    3: { enabled: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
    4: { enabled: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
    5: { enabled: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
    6: { enabled: false, timeSlots: [{ start: '08:00', end: '12:00' }] }
  });

  // Fallback to localStorage if context fails
  const getEstabelecimentoId = () => {
    if (user && user.id) return user.id;
    
    try {
      const storedUser = localStorage.getItem("@Auth:user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.id;
      }
    } catch (e) {
      console.error("Error getting user from localStorage:", e);
    }
    return null;
  };
  
  const estabelecimentoId = getEstabelecimentoId();

  // Handle toggle of a day's active status
  const handleDayToggle = (day, enabled) => {
    setDaySchedules(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled
      }
    }));
    
    // If enabling a day without time slots, add default ones
    if (enabled && (!daySchedules[day].timeSlots || daySchedules[day].timeSlots.length === 0)) {
      setDaySchedules(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          timeSlots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }]
        }
      }));
    }

    // Save changes to API
    saveScheduleForDay(day, enabled);
  };

  // Compare two time strings (HH:MM format)
  const compareTime = (time1, time2) => {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);
    
    if (hours1 > hours2) return 1;
    if (hours1 < hours2) return -1;
    if (minutes1 > minutes2) return 1;
    if (minutes1 < minutes2) return -1;
    return 0;
  };

  // Handle time slot changes
  const handleTimeChange = (day, slotIndex, field, value) => {
    setDaySchedules(prev => {
      const newTimeSlots = [...prev[day].timeSlots];
      newTimeSlots[slotIndex] = {
        ...newTimeSlots[slotIndex],
        [field]: value
      };
      return {
        ...prev,
        [day]: {
          ...prev[day],
          timeSlots: newTimeSlots
        }
      };
    });
  };

  // Add a new time slot for a day
  const addTimeSlot = (day) => {
    setDaySchedules(prev => {
      const lastSlot = prev[day].timeSlots[prev[day].timeSlots.length - 1];
      const [hours, minutes] = lastSlot.end.split(':').map(Number);
      
      // Calculate new start time (30 minutes after previous end time)
      let newStartHours = hours;
      let newStartMinutes = minutes + 30;
      
      // Adjust hours if minutes exceed 60
      if (newStartMinutes >= 60) {
        newStartHours += 1;
        newStartMinutes -= 60;
      }
      
      const newStart = `${String(newStartHours).padStart(2, '0')}:${String(newStartMinutes).padStart(2, '0')}`;
      
      // Calculate new end time (1 hour after new start time)
      let newEndHours = newStartHours + 1;
      const newEndTime = `${String(newEndHours).padStart(2, '0')}:${String(newStartMinutes).padStart(2, '0')}`;
      
      const newTimeSlots = [...prev[day].timeSlots, { start: newStart, end: newEndTime }];
      return {
        ...prev,
        [day]: {
          ...prev[day],
          timeSlots: newTimeSlots
        }
      };
    });
  };

  // Remove a time slot from a day
  const removeTimeSlot = (day, slotIndex) => {
    if (daySchedules[day].timeSlots.length <= 1) {
      showErrorToast('Não é possível remover o único horário disponível');
      return;
    }
    
    setDaySchedules(prev => {
      const newTimeSlots = prev[day].timeSlots.filter((_, index) => index !== slotIndex);
      return {
        ...prev,
        [day]: {
          ...prev[day],
          timeSlots: newTimeSlots
        }
      };
    });
  };

  // Save schedule for a specific day
  const saveScheduleForDay = async (day, enabled) => {
    if (!estabelecimentoId) {
      showErrorToast('Você precisa estar logado para gerenciar horários');
      return;
    }
    
    setSavingDay(day);
    
    try {
      // Format the data for the API
      const scheduleData = {
        estabelecimentoId,
        dias: [day],
        status: enabled ? 'A' : 'I'
      };
      
      // Add time slots if enabled
      if (enabled && daySchedules[day].timeSlots && daySchedules[day].timeSlots.length > 0) {
        // Delete any existing schedules for this day first
        await deleteSchedulesForDay(day);
        
        // Then create new schedules for each time slot
        for (const slot of daySchedules[day].timeSlots) {
          const slotData = {
            ...scheduleData,
            inicio: formatTimeToDate(slot.start),
            fim: formatTimeToDate(slot.end)
          };
          
          await api.post('/horario', slotData);
        }
        
        showSuccessToast(`Horários de ${getDayName(day)} salvos com sucesso!`);
      } else if (!enabled) {
        // If day is disabled, just deactivate all schedules for this day
        await deleteSchedulesForDay(day);
        showSuccessToast(`Horários de ${getDayName(day)} desativados com sucesso!`);
      }
      
      // Update the schedules array directly instead of doing a full fetch
      // This prevents other days from being affected when we toggle one day
      if (!enabled) {
        // Remove all schedules for this day from the schedules array
        setSchedules(prevSchedules => 
          prevSchedules.filter(schedule => !schedule.dias.includes(day))
        );
      } else {
        // We just created new schedules so we'll do a targeted fetch for just this day
        try {
          const response = await api.get(`/horario/estabelecimento/${estabelecimentoId}`);
          if (response.data && response.data.horarios) {
            // Find the newly created schedules for this day
            const newSchedules = response.data.horarios.filter(schedule => 
              schedule.status === 'A' && schedule.dias.includes(day)
            );
            
            // Update the schedules array by removing old ones for this day and adding new ones
            setSchedules(prevSchedules => {
              const filteredSchedules = prevSchedules.filter(schedule => 
                !(schedule.dias.includes(day) && schedule.status === 'A')
              );
              return [...filteredSchedules, ...newSchedules];
            });
          }
        } catch (error) {
          console.error(`Erro ao buscar horários atualizados para ${getDayName(day)}:`, error);
          // If we fail to get the updated schedules, fall back to a full refresh
          fetchSchedules();
        }
      }
    } catch (error) {
      console.error(`Erro ao salvar horários para ${getDayName(day)}:`, error);
      showErrorToast(`Não foi possível salvar os horários para ${getDayName(day)}`);
    } finally {
      setSavingDay(null);
    }
  };

  // Delete all schedules for a specific day
  const deleteSchedulesForDay = async (day) => {
    const daySchedules = schedules.filter(schedule => schedule.dias.includes(day));
    
    for (const schedule of daySchedules) {
      await api.delete(`/horario/${schedule._id}`);
    }
  };

  // Format time string to Date object
  const formatTimeToDate = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Format Date object to time string
  const formatDateToTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // Get day name from day number
  const getDayName = (day) => {
    const dayObj = daysOfWeek.find(d => d.value === parseInt(day));
    return dayObj ? dayObj.label : `Dia ${day}`;
  };

  // Fetch schedules from API
  const fetchSchedules = async () => {
    if (!estabelecimentoId) {
      showErrorToast('Não foi possível identificar o estabelecimento. Verifique se você está logado corretamente.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get(`/horario/estabelecimento/${estabelecimentoId}`);
      
      if (response.data && response.data.horarios) {
        const fetchedSchedules = response.data.horarios;
        setSchedules(fetchedSchedules);
        
        // Create a map to track which days have active schedules
        const activeDays = {};
        fetchedSchedules.forEach(schedule => {
          if (schedule.status === 'A') {
            schedule.dias.forEach(day => {
              if (!activeDays[day]) {
                activeDays[day] = [];
              }
              
              activeDays[day].push({
                start: formatDateToTime(schedule.inicio),
                end: formatDateToTime(schedule.fim)
              });
            });
          }
        });
        
        // Update day schedules based on active days, but preserve current toggle state
        // Only update the time slots for days with active schedules
        const newDaySchedules = { ...daySchedules };
        
        // Process active days
        Object.keys(activeDays).forEach(day => {
          const dayNum = parseInt(day);
          newDaySchedules[dayNum] = {
            enabled: true, // If there are active schedules, the day should be enabled
            timeSlots: activeDays[dayNum].sort((a, b) => a.start.localeCompare(b.start))
          };
        });
        
        // For days without active schedules in the database but were previously enabled,
        // keep them enabled but with no time slots
        for (let i = 0; i < 7; i++) {
          if (!activeDays[i] && daySchedules[i].enabled) {
            // Preserve the day's enabled status but reset its time slots
            newDaySchedules[i] = {
              enabled: true,
              timeSlots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }]
            };
          } else if (!activeDays[i] && !newDaySchedules[i]) {
            // If the day has no active schedules and wasn't in newDaySchedules yet,
            // add it as disabled
            newDaySchedules[i] = {
              enabled: false,
              timeSlots: []
            };
          }
        }
        
        
        setDaySchedules(newDaySchedules);
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      showErrorToast('Não foi possível carregar os horários');
    } finally {
      setLoading(false);
    }
  };

  // Load schedules and turnos when component mounts
  useEffect(() => {
    if (estabelecimentoId) {
      fetchSchedules();
      dispatch(fetchTurnos());
    }
  }, [estabelecimentoId, dispatch]);
  
  // Open turno modal for create or edit
  const handleOpenTurnoModal = (turno = null) => {
    if (turno) {
      // Edit existing turno
      setSelectedTurno(turno);
      setTurnoName(turno.nome);
      
      // Convert date strings to time strings
      const startTime = new Date(turno.inicio);
      const endTime = new Date(turno.fim);
      setTurnoStartTime(`${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`);
      setTurnoEndTime(`${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`);
      
      setTurnoDays(turno.dias || []);
      setTurnoStatus(turno.status || 'A');
    } else {
      // Create new turno
      setSelectedTurno(null);
      setTurnoName('');
      setTurnoStartTime('08:00');
      setTurnoEndTime('12:00');
      setTurnoDays([1, 2, 3, 4, 5]); // Default to weekdays
      setTurnoStatus('A');
    }
    setShowTurnoModal(true);
  };

  // Handle day selection in turno modal
  const handleTurnoDayToggle = (day) => {
    setTurnoDays(prevDays => {
      if (prevDays.includes(day)) {
        return prevDays.filter(d => d !== day);
      } else {
        return [...prevDays, day].sort();
      }
    });
  };

  // Save turno
  const handleSaveTurno = () => {
    // Convert time strings to date objects
    const [startHours, startMinutes] = turnoStartTime.split(':').map(Number);
    const [endHours, endMinutes] = turnoEndTime.split(':').map(Number);
    
    const startDate = new Date();
    startDate.setHours(startHours, startMinutes, 0, 0);
    
    const endDate = new Date();
    endDate.setHours(endHours, endMinutes, 0, 0);
    
    const turnoData = {
      nome: turnoName,
      dias: turnoDays,
      inicio: startDate,
      fim: endDate,
      status: turnoStatus,
      estabelecimentoId
    };
    
    if (selectedTurno) {
      // Update existing turno
      dispatch(updateTurno({
        ...turnoData,
        _id: selectedTurno._id
      }));
    } else {
      // Create new turno
      dispatch(saveTurno(turnoData));
    }
    
    setShowTurnoModal(false);
    
    // Refresh schedules after a delay to allow turno update to complete
    setTimeout(() => {
      fetchSchedules();
    }, 500);
  };

  // Delete turno
  const handleDeleteTurno = (turno) => {
    if (window.confirm(`Tem certeza que deseja excluir o turno "${turno.nome}"?`)) {
      dispatch(deleteTurno(turno._id));
    }
  };

  // Toggle turno status
  const handleToggleTurnoStatus = (turno) => {
    if (turno.status === 'A') {
      dispatch(deactivateTurno(turno._id));
    } else {
      dispatch(activateTurno(turno._id));
    }
  };

  // Debug logs
  useEffect(() => {
    console.log('=== DEBUG AUTH INFO ===');
    console.log('Auth Context User:', user);
    console.log('EstabelecimentoId:', estabelecimentoId);
    console.log('LocalStorage User:', localStorage.getItem('@Auth:user'));
    console.log('LocalStorage Token:', localStorage.getItem('@Auth:token'));
    console.log('=== END DEBUG ===');
  }, [user, estabelecimentoId]);

  // Generate time options for selects
  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += intervalMinutes) {
        const hour = String(h).padStart(2, '0');
        const minute = String(m).padStart(2, '0');
        const time = `${hour}:${minute}`;
        options.push({ label: time, value: time });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="col p-4 overflow-auto h-100 " style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <div className="row">
        <div className="col-12">
          <p className="mb-4 mt-0 text-2xl font-bold" >Horários de Atendimento</p>
          <p className="text-muted mb-4 font-bold">
            Configure os dias e horários disponíveis para atendimento.
          </p>

          {/* Schedule configuration card */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              {/* Interval information */}
              <div className="mb-4 interval-info-container">
                <div className="interval-info">
                  <label className="mb-2 d-block">
                    <div className="d-flex align-items-center">
                      <span>Intervalo entre horários</span>
                      <Icon icon="question-circle" className="ml-2" style={{ color: '#6c757d' }} />
                    </div>
                  </label>
                  <div className="interval-value">
                    <div className="interval-dropdown">
                      <span>{intervalMinutes} minutos</span>
                      <Icon icon="angle-down" className="ml-2" style={{ color: '#6c757d' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Days of week schedule */}
              <div className="schedule-days-container">
                {loading ? (
                  <div className="text-center py-5">
                    <Icon icon="spinner" spin size="2x" />
                    <p className="mt-2">Carregando horários...</p>
                  </div>
                ) : (
                  daysOfWeek.map(day => (
                    <div key={day.value} className="day-schedule-row">
                      {/* Day name and toggle */}
                      <div className="day-name-container">
                        <div className="day-name">{day.label}</div>
                        <Toggle 
                          checked={daySchedules[day.value].enabled} 
                          onChange={checked => handleDayToggle(day.value, checked)}
                          disabled={savingDay === day.value}
                          size="md"
                        />
                      </div>

                      {/* Time slots */}
                      {daySchedules[day.value].enabled && (
                        <div className="time-slots-container">
                          {daySchedules[day.value].timeSlots.map((slot, index) => (
                            <div key={index} className="mb-4">
                              <div className="shift-label mb-2">
                                {index + 1}º Turno
                              </div>
                              <div className="time-slot">
                                <div className="time-inputs">
                                  <SelectPicker 
                                    data={timeOptions.filter(option => {
                                      // If not the first slot, start time must be greater than previous slot's end time
                                      if (index > 0) {
                                        const prevSlot = daySchedules[day.value].timeSlots[index - 1];
                                        return compareTime(option.value, prevSlot.end) >= 0 && 
                                               compareTime(option.value, slot.end) < 0;
                                      }
                                      return compareTime(option.value, slot.end) < 0;
                                    })} 
                                    value={slot.start}
                                    onChange={value => handleTimeChange(day.value, index, 'start', value)}
                                    cleanable={false}
                                    searchable={false}
                                    placement="autoVerticalStart"
                                    className="time-select"
                                  />
                                  <span className="time-separator">até</span>
                                  <SelectPicker 
                                    data={timeOptions.filter(option => {
                                      // End time must be greater than current start time
                                      // If not the last slot, end time must be less than next slot's start time
                                      const isGreaterThanStart = compareTime(option.value, slot.start) > 0;
                                      if (index < daySchedules[day.value].timeSlots.length - 1) {
                                        const nextSlot = daySchedules[day.value].timeSlots[index + 1];
                                        return isGreaterThanStart && compareTime(option.value, nextSlot.start) <= 0;
                                      }
                                      return isGreaterThanStart;
                                    })} 
                                    value={slot.end}
                                    onChange={value => handleTimeChange(day.value, index, 'end', value)}
                                    cleanable={false}
                                    searchable={false}
                                    placement="autoVerticalStart"
                                    className="time-select"
                                  />
                                </div>
                                <div className="time-actions">
                                  <Button 
                                    appearance="subtle" 
                                    className="remove-slot-btn"
                                    onClick={() => removeTimeSlot(day.value, index)}
                                    disabled={daySchedules[day.value].timeSlots.length <= 1}
                                  >
                                    <Icon icon="trash" style={{ color: '#dc3545' }} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Add time slot button */}
                          <Button 
                            appearance="ghost" 
                            className="add-time-slot-btn" 
                            onClick={() => addTimeSlot(day.value)}
                            block
                          >
                            <Icon icon="plus" /> Adicionar Horário
                          </Button>

                          {/* Save button for this day */}
                          <div className="mt-3">
                            <Button
                              appearance="primary"
                              onClick={() => saveScheduleForDay(day.value, true)}
                              disabled={savingDay === day.value}
                              block
                            >
                              {savingDay === day.value ? (
                                <><Icon icon="spinner" spin /> Salvando...</>
                              ) : (
                                <><Icon icon="save" /> Salvar</>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Turnos Management Card */}
          <div className="card shadow-sm mb-4 mt-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Turnos de Trabalho</h5>
                <Button appearance="primary" onClick={() => handleOpenTurnoModal()}>
                  <Icon icon="plus" /> Novo Turno
                </Button>
              </div>
              
              {turnos.length === 0 ? (
                <div className="text-center py-4">
                  <Icon icon="calendar" style={{ fontSize: '2rem', color: '#6c757d' }} />
                  <p className="mt-2 text-muted">Nenhum turno configurado. Crie um novo turno para definir os horários de funcionamento.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Horário</th>
                        <th>Dias</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {turnos.map(turno => {
                        const startDate = new Date(turno.inicio);
                        const endDate = new Date(turno.fim);
                        const timeStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')} - ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
                        
                        // Get day names
                        const dayNames = turno.dias.map(day => {
                          const dayObj = daysOfWeek.find(d => d.value === day);
                          return dayObj ? dayObj.label.substring(0, 3) : `Dia ${day}`;
                        }).join(', ');
                        
                        return (
                          <tr key={turno._id}>
                            <td>{turno.nome}</td>
                            <td>{timeStr}</td>
                            <td>{dayNames}</td>
                            <td>
                              <span className={`badge ${turno.status === 'A' ? 'bg-success' : 'bg-secondary'}`}>
                                {turno.status === 'A' ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group">
                                <Button appearance="link" onClick={() => handleOpenTurnoModal(turno)}>
                                  <Icon icon="edit2" />
                                </Button>
                                <Button appearance="link" onClick={() => handleToggleTurnoStatus(turno)}>
                                  {turno.status === 'A' ? <Icon icon="stop" style={{color: '#dc3545'}} /> : <Icon icon="play" style={{color: '#28a745'}} />}
                                </Button>
                                <Button appearance="link" onClick={() => handleDeleteTurno(turno)}>
                                  <Icon icon="trash" style={{color: '#dc3545'}} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Information card */}
          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title">Dicas para configuração de horários</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Icon icon="info-circle" style={{color: "blue"}} /> Os horários são configurados com intervalos de 30 minutos conforme regra do sistema.
                </li>
                <li className="mb-2">
                  <Icon icon="info-circle" style={{color: "blue"}} /> Desative os dias em que seu estabelecimento não funciona.
                </li>
                <li className="mb-2">
                  <Icon icon="info-circle" style={{color: "blue"}} /> Para horários com pausas (como almoço), adicione múltiplos blocos de horário.
                </li>
                <li className="mb-2">
                  <Icon icon="info-circle" style={{color: "blue"}} /> Lembre-se de salvar suas alterações depois de configurar cada dia.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Aviso quando não há usuário logado */}
      {!user && (
        <div className="alert alert-warning mt-4">
          <Icon icon="exclamation-triangle" /> Para gerenciar horários, você precisa estar logado no sistema.
        </div>
      )}
      
      {/* Turno Modal */}
      <Modal show={showTurnoModal} onHide={() => setShowTurnoModal(false)}>
        <Modal.Header>
          <Modal.Title>{selectedTurno ? 'Editar Turno' : 'Novo Turno'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group mb-3">
            <label>Nome do Turno</label>
            <input
              type="text"
              className="form-control"
              value={turnoName}
              onChange={(e) => setTurnoName(e.target.value)}
              placeholder="Ex: Manhã (Seg-Sex)"
            />
          </div>
          
          <div className="row mb-3">
            <div className="col-6">
              <div className="form-group">
                <label>Horário Início</label>
                <SelectPicker
                  data={timeOptions}
                  value={turnoStartTime}
                  onChange={setTurnoStartTime}
                  cleanable={false}
                  searchable={false}
                  block
                />
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label>Horário Fim</label>
                <SelectPicker
                  data={timeOptions.filter(t => compareTime(t.value, turnoStartTime) > 0)}
                  value={turnoEndTime}
                  onChange={setTurnoEndTime}
                  cleanable={false}
                  searchable={false}
                  block
                />
              </div>
            </div>
          </div>
          
          <div className="form-group mb-3">
            <label>Dias da Semana</label>
            <div className="days-checkboxes">
              {daysOfWeek.map(day => (
                <div key={day.value} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`day-${day.value}`}
                    checked={turnoDays.includes(day.value)}
                    onChange={() => handleTurnoDayToggle(day.value)}
                  />
                  <label className="form-check-label" htmlFor={`day-${day.value}`}>
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Status</label>
            <div>
              <Toggle
                checked={turnoStatus === 'A'}
                onChange={(checked) => setTurnoStatus(checked ? 'A' : 'I')}
              />
              <span className="ml-2">{turnoStatus === 'A' ? 'Ativo' : 'Inativo'}</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowTurnoModal(false)} appearance="subtle">
            Cancelar
          </Button>
          <Button onClick={handleSaveTurno} appearance="primary" color="green">
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Horarios;