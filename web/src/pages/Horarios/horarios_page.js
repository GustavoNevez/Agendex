import React, { useState, useEffect, useContext } from 'react';
import { Toggle, Icon, Button, SelectPicker, Modal } from 'rsuite';
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

// Group days for common configurations
const dayGroups = [
  { label: 'Dias úteis (Segunda a Sexta)', values: [1, 2, 3, 4, 5] },
  { label: 'Final de semana', values: [0, 6] },
  { label: 'Todos os dias', values: [0, 1, 2, 3, 4, 5, 6] }
];

const Horarios = () => {
  // Use AuthContext directly
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [savingDay, setSavingDay] = useState(null);
  const [intervalMinutes] = useState(30); // Fixed 30 minute intervals as per requirement
  
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

  // Modal state for confirmations
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    action: null,
    actionParams: null
  });

  // Function to show confirmation for day toggle with event handling
  const confirmDayToggle = (day, enabled, event) => {
    // Prevent any bubbling or default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Use setTimeout to ensure any toggle state changes complete first
    setTimeout(() => {
      const action = enabled ? 'ativar' : 'desativar';
      
      setConfirmModal({
        show: true,
        title: `Confirmar alteração`,
        message: `Você tem certeza que deseja ${action} o dia ${getDayName(day)}?`,
        action: applyDayToggle,
        actionParams: [day, enabled]
      });
    }, 50);
  };
  
  // Function to actually toggle day status after confirmation and save to database
  const applyDayToggle = async (day, enabled) => {
    // Update local state first
    let timeSlots = [...daySchedules[day].timeSlots];
    
    // If enabling a day without time slots, add default ones
    if (enabled && (!timeSlots || timeSlots.length === 0)) {
      timeSlots = [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }];
    }
    
    // Apply change to local state
    setDaySchedules(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled,
        timeSlots
      }
    }));
    
    // Save the change to the database (call the same function used by the save button)
    try {
      setSavingDay(day);
      await saveScheduleForDays([day], enabled, timeSlots);
      showSuccessToast(`Dia ${getDayName(day)} ${enabled ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error(`Erro ao ${enabled ? 'ativar' : 'desativar'} o dia:`, error);
      showErrorToast(`Não foi possível ${enabled ? 'ativar' : 'desativar'} o dia. Tente novamente.`);
      
      // Revert the UI state if the API call fails
      setDaySchedules(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          enabled: !enabled // Revert to the opposite state
        }
      }));
    } finally {
      setSavingDay(null);
    }
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
      // Check if there are no time slots yet
      if (!prev[day].timeSlots || prev[day].timeSlots.length === 0) {
        // If no slots exist, create a default one
        return {
          ...prev,
          [day]: {
            ...prev[day],
            timeSlots: [{ start: '08:00', end: '12:00' }]
          }
        };
      }
      
      // Otherwise, add a slot after the last one
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
      
      return {
        ...prev,
        [day]: {
          ...prev[day],
          timeSlots: [...prev[day].timeSlots, { start: newStart, end: newEndTime }]
        }
      };
    });
    
    // Show toast but don't auto-save (user will save manually)
    showSuccessToast('Novo turno adicionado! Clique em Salvar para confirmar.');
  };

  // Ask for confirmation before removing a time slot
  const confirmRemoveTimeSlot = (day, slotIndex) => {
    if (daySchedules[day].timeSlots.length <= 1) {
      showErrorToast('Não é possível remover o único horário disponível');
      return;
    }
    
    const turnoNumero = slotIndex + 1;
    
    setConfirmModal({
      show: true,
      title: 'Remover Turno',
      message: `Tem certeza que deseja remover o ${turnoNumero}º turno de ${getDayName(day)}?`,
      action: removeTimeSlot,
      actionParams: [day, slotIndex]
    });
  };
  
  // Actually remove the time slot after confirmation
  const removeTimeSlot = (day, slotIndex) => {
    let newTimeSlots = [];
    
    setDaySchedules(prev => {
      newTimeSlots = prev[day].timeSlots.filter((_, index) => index !== slotIndex);
      return {
        ...prev,
        [day]: {
          ...prev[day],
          timeSlots: newTimeSlots
        }
      };
    });
  };

  // Function to show confirmation modal before saving schedule
  const confirmSaveSchedule = (days, enabled, timeSlots) => {
    const daysText = days.length > 1 
      ? `${days.map(d => getDayName(d)).join(', ')}` 
      : getDayName(days[0]);
    
    const action = enabled ? 'ativar' : 'desativar';
    
    setConfirmModal({
      show: true,
      title: `Confirmar alteração`,
      message: `Você tem certeza que deseja ${action} os horários para ${daysText}?`,
      action: saveScheduleForDays,
      actionParams: [days, enabled, timeSlots]
    });
  };

  // Function that actually saves the schedule after confirmation
  const saveScheduleForDays = async (days, enabled, timeSlots) => {
    if (!estabelecimentoId) {
      showErrorToast('Você precisa estar logado para gerenciar horários');
      return;
    }
    
    setSavingDay('multiple'); // Indicate we're saving multiple days
    
    try {
      // Prepare the turno configuration data with ALL days' configurations
      const turnoData = {
        estabelecimentoId,
        turnos: {}
      };
      
      // First, add all existing day configurations to preserve them
      for (let i = 0; i < 7; i++) {
        // Skip days that are being updated (they'll be added next)
        if (days.includes(i)) continue;
        
        turnoData.turnos[i] = {
          ativo: daySchedules[i].enabled,
          periodos: daySchedules[i].timeSlots.map(slot => ({
            inicio: slot.start,
            fim: slot.end,
            ativo: true
          }))
        };
      }
      
      // Now add the days being updated with their new configuration
      days.forEach(day => {
        turnoData.turnos[day] = {
          ativo: enabled,
          periodos: timeSlots.map(slot => ({
            inicio: slot.start,
            fim: slot.end,
            ativo: true
          }))
        };
      });
      
      // Use the configurar endpoint to update all days at once
      await api.post('/turno/configurar', turnoData);
      
      const daysText = days.length > 1 
        ? `${days.map(d => getDayName(d)).join(', ')}` 
        : getDayName(days[0]);
      
      if (enabled) {
        showSuccessToast(`Horários de ${daysText} salvos com sucesso!`);
      } else {
        showSuccessToast(`Horários de ${daysText} desativados com sucesso!`);
      }
      
      // Refresh the schedules to get the updated data
      fetchSchedules();
    } catch (error) {
      console.error('Erro ao salvar horários:', error);
      showErrorToast('Não foi possível salvar os horários');
    } finally {
      setSavingDay(null);
    }
  };

  // Function to confirm saving a single day (maintains compatibility)
  const confirmSaveScheduleForDay = (day, enabled) => {
    confirmSaveSchedule([day], enabled, daySchedules[day].timeSlots);
  };
  
  // Legacy function for direct saving (used internally after confirmation)
  const saveScheduleForDay = async (day, enabled) => {
    return saveScheduleForDays([day], enabled, daySchedules[day].timeSlots);
  };
  
  // Function to find days with the same schedule
  const findDaysWithSameSchedule = (dayToCompare) => {
    const result = [];
    const refConfig = daySchedules[dayToCompare];
    
    if (!refConfig) return result;
    
    for (let i = 0; i < 7; i++) {
      if (i === dayToCompare) continue; // Skip the reference day itself
      
      const currentConfig = daySchedules[i];
      
      if (currentConfig.enabled === refConfig.enabled && 
          JSON.stringify(currentConfig.timeSlots) === JSON.stringify(refConfig.timeSlots)) {
        result.push(i);
      }
    }
    
    return result;
  };
  
  // Function to apply a day's schedule to other days
  const applyScheduleToOtherDays = (sourceDay, targetDays) => {
    const newSchedules = { ...daySchedules };
    
    // Apply the source day's configuration to all target days
    targetDays.forEach(day => {
      if (day !== sourceDay) {
        newSchedules[day] = {
          enabled: newSchedules[sourceDay].enabled,
          timeSlots: [...newSchedules[sourceDay].timeSlots.map(slot => ({...slot}))]
        };
      }
    });
    
    setDaySchedules(newSchedules);
  };

  // Get day name from day number
  const getDayName = (day) => {
    const dayObj = daysOfWeek.find(d => d.value === parseInt(day));
    return dayObj ? dayObj.label : `Dia ${day}`;
  };

  // Fetch schedules from API using new turno route
  const fetchSchedules = async () => {
    if (!estabelecimentoId) {
      showErrorToast('Não foi possível identificar o estabelecimento. Verifique se você está logado corretamente.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get(`/turno/estabelecimento/${estabelecimentoId}`);
      
      if (response.data && !response.data.error) {
        const turnosPorDia = response.data.turnos;
        
        // Convert backend structure to our frontend format
        const newDaySchedules = {};
        
        for (let i = 0; i < 7; i++) {
          if (turnosPorDia[i]) {
            newDaySchedules[i] = {
              enabled: turnosPorDia[i].ativo,
              timeSlots: turnosPorDia[i].periodos.map(periodo => ({
                start: periodo.inicio,
                end: periodo.fim,
                ativo: periodo.ativo
              }))
            };
          } else {
            // Default empty structure if no data
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

  // Load schedules when component mounts
  useEffect(() => {
    if (estabelecimentoId) {
      fetchSchedules();
    }
  }, [estabelecimentoId]);

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
    <div className="col p-4 overflow-auto h-100   " style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <div className="row md:px-80">
        <div className="col-12 ">
         

          {/* Schedule configuration card */}
          <div className="card  mb-4 ">
            <div className="card-body bg-white rounded-xl shadow-lg overflow-hidden   ">
              
            <p className="mb-4 mt-0 text-2xl font-bold" >Horários de Atendimento</p>
          <p className="text-muted mb-4 font-bold">
            Configure os dias e horários disponíveis para atendimento.
          </p>
              {/* Quick actions for day groups */}
              {!loading && (
                <div className="mb-4 day-groups-container">
                  
                  <div className="row">
                    {dayGroups.map((group, idx) => (
                      <div key={idx} className="col-md-4 mb-3">
                        <div className="card h-100">
                          <div className="card-body ">
                            <h6 className="card-title">{group.label}</h6>
                            <div className="d-flex mt-3">
                              <Button
                                appearance="primary"
                                color="green"
                                size="sm"
                                onClick={() => {
                                  // Create a template with default hours
                                  const defaultTimeSlots = [
                                    { start: '08:00', end: '12:00' },
                                    { start: '13:00', end: '18:00' }
                                  ];
                                  // Show confirmation before applying to all days in group
                                  confirmSaveSchedule(group.values, true, defaultTimeSlots);
                                }}
                                className="mr-2"
                              >
                                <Icon icon="check" /> Ativar
                              </Button>
                              <Button
                                appearance="primary"
                                color="red"
                                size="sm"
                                onClick={() => {
                                  // Show confirmation before disabling all days in group
                                  confirmSaveSchedule(group.values, false, []);
                                }}
                              >
                                <Icon icon="close" /> Desativar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Days of week schedule */}
              <div className="schedule-days-container">
                {loading ? (
                  <div className="text-center py-5">
                    <Icon icon="spinner" spin size="2x" />
                    <p className="mt-2">Carregando horários...</p>
                  </div>
                ) : (
                  daysOfWeek.map(day => {
                    // Find other days with the same schedule for showing shared info
                    const sharedDays = findDaysWithSameSchedule(day.value);
                    
                    return (
                      <div key={day.value} className="day-schedule-row">
                        {/* Day name and toggle */}
                        <div className="day-name-container">
                          <div className="day-name">{day.label}</div>
                          <Toggle 
                            checked={daySchedules[day.value].enabled} 
                            onChange={(checked, event) => confirmDayToggle(day.value, checked, event)}
                            disabled={savingDay === day.value || savingDay === 'multiple'}
                            size="md"
                          />
                        </div>

                        {/* Time slots */}
                        {daySchedules[day.value].enabled && (
                          <div className="time-slots-container">
                            {/* Show shared schedule info */}
                            {sharedDays.length > 0 && (
                              <div className="shared-schedule-info mb-3">
                                <p className="text-info mb-2">
                                  <Icon icon="link" /> Compartilha a mesma configuração com: {' '}
                                  {sharedDays.map(d => getDayName(d)).join(', ')}
                                </p>
                              </div>
                            )}
                          
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
                                      onClick={() => confirmRemoveTimeSlot(day.value, index)}
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
                              <Icon icon="plus" /> Adicionar Turno
                            </Button>

                            {/* Save and apply buttons */}
                            <div className="mt-3 d-flex">
                              <Button
                                appearance="primary"
                                onClick={() => confirmSaveScheduleForDay(day.value, true)}
                                disabled={savingDay === day.value || savingDay === 'multiple'}
                                block
                                className="mr-2"
                              >
                                {savingDay === day.value || savingDay === 'multiple' ? (
                                  <><Icon icon="spinner" spin /> Salvando...</>
                                ) : (
                                  <><Icon icon="save" /> Salvar</>
                                )}
                              </Button>
                              
                              
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
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
      
      {/* Confirmation Modal */}
      <Modal
        show={confirmModal.show}
        onHide={() => setConfirmModal({ ...confirmModal, show: false })}
        size="xs"
        backdrop="static" // Prevent closing when clicking outside
        keyboard={false} // Prevent closing with keyboard (escape key)
      >
        <Modal.Header>
          <Modal.Title>{confirmModal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{confirmModal.message}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            appearance="primary"
            onClick={() => {
              setConfirmModal({ ...confirmModal, show: false });
              if (confirmModal.action && confirmModal.actionParams) {
                confirmModal.action(...confirmModal.actionParams);
              }
            }}
          >
            Confirmar
          </Button>
          <Button
            appearance="subtle"
            onClick={() => setConfirmModal({ ...confirmModal, show: false })}
          >
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Horarios;