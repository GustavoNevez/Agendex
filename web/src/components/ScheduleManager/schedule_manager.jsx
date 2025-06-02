import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Icon, Tag, DatePicker, SelectPicker, CheckPicker, Toggle, Tooltip, Whisper } from 'rsuite';
import CustomModal from '../Modal'; // Import our reusable Modal component
import api from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../utils/notifications';

const daysOfWeek = [
  { label: 'Domingo', value: 0 },
  { label: 'Segunda-feira', value: 1 },
  { label: 'Terça-feira', value: 2 },
  { label: 'Quarta-feira', value: 3 },
  { label: 'Quinta-feira', value: 4 },
  { label: 'Sexta-feira', value: 5 },
  { label: 'Sábado', value: 6 }
];

const ScheduleManager = ({ 
  estabelecimentoId,
  profissionalId = null, 
  onClose,
  isOpen 
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    dias: [],
    inicio: new Date('2025-01-01T08:00:00.000Z'),
    fim: new Date('2025-01-01T18:00:00.000Z'),
    tipoServico: [],
    status: 'A' // Default to active
  });
  const [statusLoading, setStatusLoading] = useState(null); // Track which schedule is having its status updated
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmActivate, setShowConfirmActivate] = useState(false);
  const [scheduleToToggle, setScheduleToToggle] = useState(null);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictingDays, setConflictingDays] = useState([]);
  const { servicos } = useSelector(state => state.servico) || { servicos: [] };

  // Carregar horários quando o componente montar
  useEffect(() => {
    if (isOpen && estabelecimentoId) {
      fetchSchedules();
    }
  }, [isOpen, estabelecimentoId, profissionalId]);

  const fetchSchedules = async () => {
    if (!estabelecimentoId) {
      showErrorToast('Não foi possível identificar o estabelecimento. Verifique se você está logado corretamente.');
      return;
    }
    
    setLoading(true);
    try {
      let response;
      if (profissionalId) {
        response = await api.get(`/horario/profissional/${profissionalId}`);
      } else {
        response = await api.get(`/horario/estabelecimento/${estabelecimentoId}`);
      }
      
      if (response.data && response.data.horarios) {
        setSchedules(response.data.horarios);
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      showErrorToast('Não foi possível carregar os horários');
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async () => {
    if (!estabelecimentoId) {
      showErrorToast('Não foi possível identificar o estabelecimento');
      return;
    }
    
    if (!newSchedule.dias.length) {
      showErrorToast('Selecione pelo menos um dia da semana');
      return;
    }

    setLoading(true);
    try {
      // Base schedule data without profissionalId
      const scheduleData = {
        ...newSchedule,
        estabelecimentoId
      };
      
      // Add profissionalId only if it's provided
      if (profissionalId) {
        scheduleData.profissionalId = profissionalId;
      }
      
      const response = await api.post('/horario', scheduleData);
      
      if (response.data && !response.data.error) {
        showSuccessToast('Horário criado com sucesso!');
        setShowAddModal(false);
        fetchSchedules();
        resetNewSchedule();
      } else {
        showErrorToast(response.data.message || 'Erro ao criar horário');
      }
    } catch (error) {
      console.error('Erro ao salvar horário:', error);
      showErrorToast('Não foi possível salvar o horário');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteSchedule = (schedule) => {
    setScheduleToDelete(schedule);
    setShowConfirmDelete(true);
  };

  const deleteSchedule = async () => {
    if (!scheduleToDelete || !scheduleToDelete._id) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete(`/horario/${scheduleToDelete._id}`);
      
      if (response.data && !response.data.error) {
        showSuccessToast('Horário removido com sucesso!');
        setShowConfirmDelete(false);
        fetchSchedules();
      } else {
        showErrorToast(response.data.message || 'Erro ao remover horário');
      }
    } catch (error) {
      console.error('Erro ao remover horário:', error);
      showErrorToast('Não foi possível remover o horário');
    } finally {
      setLoading(false);
      setScheduleToDelete(null);
    }
  };

  // Handle toggle click - if deactivating, do it directly; if activating, show confirmation
  const handleToggleClick = (schedule) => {
    if (!schedule || !schedule._id) return;
    
    if (schedule.status === 'A') {
      // Deactivating is always safe - do it directly
      deactivateSchedule(schedule);
    } else {
      // Activating might cause conflicts - check conflicts and show confirmation
      setScheduleToToggle(schedule);
      // Check for conflicts immediately when selecting a schedule to activate
      checkScheduleConflicts(schedule);
      setShowConfirmActivate(true);
    }
  };
  
  // Directly deactivate a schedule (no conflict validation needed)
  const deactivateSchedule = async (schedule) => {
    if (!schedule || !schedule._id) return;
    
    setStatusLoading(schedule._id);
    try {
      const response = await api.put(`/horario/status/${schedule._id}`, {
        status: 'I'
      });
      
      if (response.data && !response.data.error) {
        showSuccessToast(response.data.message || 'Horário desativado com sucesso!');
        fetchSchedules();
      } else {
        showErrorToast(response.data.message || 'Erro ao desativar horário');
      }
    } catch (error) {
      console.error('Erro ao desativar horário:', error);
      showErrorToast('Não foi possível desativar o horário');
    } finally {
      setStatusLoading(null);
    }
  };
  
  // Check for conflicts between the schedule to activate and other active schedules
  const checkScheduleConflicts = (schedule) => {
    if (!schedule || !schedule.dias || !schedules) {
      setHasConflict(false);
      setConflictingDays([]);
      return;
    }
    
    // Find active schedules except the current one
    const activeSchedules = schedules.filter(s => 
      s.status === 'A' && s._id !== schedule._id
    );
    
    // Check if the schedule has the same scope as other active schedules
    const sameScope = activeSchedules.filter(s => {
      // Same scope means both are for establishment or both are for the same professional
      const bothForEstablishment = !s.profissionalId && !schedule.profissionalId;
      const bothForSameProfessional = 
        s.profissionalId && 
        schedule.profissionalId && 
        s.profissionalId.toString() === schedule.profissionalId.toString();
        
      return bothForEstablishment || bothForSameProfessional;
    });
    
    // Check for day conflicts in the same scope
    let conflicts = [];
    sameScope.forEach(existingSchedule => {
      const dayConflicts = schedule.dias.filter(day => 
        existingSchedule.dias.includes(day)
      );
      
      if (dayConflicts.length > 0) {
        conflicts.push(...dayConflicts);
      }
    });
    
    // Set conflict state based on the results
    const uniqueConflicts = [...new Set(conflicts)];
    setHasConflict(uniqueConflicts.length > 0);
    setConflictingDays(uniqueConflicts);
    
    console.log('Conflict check:', uniqueConflicts.length > 0 ? 'Found conflicts' : 'No conflicts');
    return uniqueConflicts.length > 0;
  };
  
  // Attempt to activate a schedule (if no conflicts detected)
  const activateSchedule = async () => {
    if (!scheduleToToggle || !scheduleToToggle._id) return;
    
    setStatusLoading(scheduleToToggle._id);
    try {
      console.log('Enviando solicitação para ativar horário:', scheduleToToggle._id);
      
      const response = await api.put(`/horario/status/${scheduleToToggle._id}`, {
        status: 'A'
      });
      
      console.log('Resposta do servidor para ativação:', response.data);
      
      if (response.data && response.data.error === false) {
        showSuccessToast(response.data.message || 'Horário ativado com sucesso!');
        setShowConfirmActivate(false);
        fetchSchedules();
      } else {
        // Handle error - backend returns {error: true, message: "..."} for conflicts
        const errorMsg = response.data.message || 'Erro ao ativar horário';
        console.error('Erro retornado pelo servidor:', response.data);
        showErrorToast(errorMsg);
        
        // Keep modal open if there was a conflict
        if (errorMsg.includes('conflita') || errorMsg.includes('conflito')) {
          // Stay on confirmation screen so user can see error and decide what to do
        } else {
          setShowConfirmActivate(false);
        }
        
        // Refresh data to ensure UI is in sync with backend state
        fetchSchedules();
      }
    } catch (error) {
      console.error('Erro ao ativar horário:', error);
      showErrorToast('Não foi possível ativar o horário');
      setShowConfirmActivate(false);
      
      // Refresh data to ensure UI is in sync with backend state
      fetchSchedules();
    } finally {
      setStatusLoading(null);
    }
  };

  const resetNewSchedule = () => {
    // Initialize with default values - weekdays 8-18, Saturday 9-16
    const isEstablishmentSchedule = !profissionalId;
    
    setNewSchedule({
      dias: [],
      inicio: new Date('2025-01-01T08:00:00.000Z'),
      fim: isEstablishmentSchedule && !newSchedule.dias?.includes(6) 
        ? new Date('2025-01-01T18:00:00.000Z')  // Weekday end time
        : isEstablishmentSchedule && newSchedule.dias?.includes(6)
          ? new Date('2025-01-01T16:00:00.000Z')  // Saturday end time for establishment
          : new Date('2025-01-01T18:00:00.000Z'),  // Default end time
      tipoServico: [],
      status: 'A' // Default to active
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDays = (dias) => {
    if (!dias || !dias.length) return '';
    return dias.map(dia => {
      const dayObj = daysOfWeek.find(d => d.value === dia);
      return dayObj ? dayObj.label.substring(0, 3) : '';
    }).join(', ');
  };

  return (
    <div
      className={isOpen ? "schedule-manager-overlay" : ""}
      style={{
        display: isOpen ? 'flex' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1050,
        justifyContent: 'center',
        alignItems: 'center',
        padding: '15px'
      }}
      onClick={(e) => {
        // Close when clicking the overlay background
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          width: window.innerWidth < 768 ? '100%' : '500px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h4 style={{
            margin: 0,
            fontSize: window.innerWidth < 768 ? '1.1rem' : '1.25rem'
          }}>
            {profissionalId ? 'Horários do Profissional' : 'Horários do Estabelecimento'}
          </h4>
          <Button appearance="subtle" onClick={onClose}>
            <Icon icon="close" />
          </Button>
        </div>
        
        {/* Body */}
        <div style={{ 
          padding: '15px', 
          overflowY: 'auto',
          maxHeight: 'calc(90vh - 130px)'
        }}>
          <div className="text-center mb-3">
            <Button 
              appearance="primary" 
              onClick={() => setShowAddModal(true)}
              disabled={loading}
              block
              size={window.innerWidth < 768 ? 'md' : 'lg'}
              style={{
                padding: window.innerWidth < 768 ? '8px 12px' : undefined,
                fontSize: window.innerWidth < 768 ? '14px' : undefined
              }}
            >
              <Icon icon="plus" /> Adicionar Horário
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Icon icon="spinner" spin size="2x" />
              <p className="mt-2">Carregando horários...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-5">
              <p>Nenhum horário configurado.</p>
              <p>Clique em "Adicionar Horário" para configurar novos horários.</p>
            </div>
          ) : (
            <div className="schedule-list">
              {schedules.map((schedule, index) => (
                <div 
                  key={schedule._id || index} 
                  className={`schedule-item border rounded p-3 mb-3 ${schedule.status === 'I' ? 'schedule-inactive' : ''}`}
                  style={{
                    borderLeft: `5px solid ${schedule.status === 'A' ? '#4caf50' : '#9e9e9e'}`,
                    opacity: schedule.status === 'A' ? 1 : 0.7,
                    backgroundColor: schedule.status === 'A' ? '#fff' : '#f9f9f9'
                  }}
                >
                  {/* Header with days and toggle */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                      <h5 className="mb-0 mr-2" style={{ fontSize: window.innerWidth < 768 ? '0.95rem' : undefined }}>
                        {formatDays(schedule.dias)}
                      </h5>
                      <Tag color={schedule.status === 'A' ? 'green' : 'default'} size="sm">
                        {schedule.status === 'A' ? 'Ativo' : 'Inativo'}
                      </Tag>
                    </div>
                    <div>
                      <Whisper
                        placement="top"
                        trigger="hover"
                        speaker={<Tooltip>{schedule.status === 'A' ? 'Desativar horário' : 'Ativar horário'}</Tooltip>}
                      >
                        <Toggle
                          size={window.innerWidth < 768 ? "md" : "sm"}
                          checked={schedule.status === 'A'}
                          onChange={() => handleToggleClick(schedule)}
                          disabled={statusLoading === schedule._id}
                        />
                      </Whisper>
                    </div>
                  </div>
                  
                  {/* Schedule details */}
                  <div className="mb-3">
                    <p className="mb-2">
                      <strong>Horário:</strong> {formatTime(schedule.inicio)} - {formatTime(schedule.fim)}
                    </p>
                    {schedule.tipoServico && schedule.tipoServico.length > 0 && (
                      <div className="mb-0">
                        <strong>Serviços:</strong>
                        <div className="mt-1">
                          {schedule.tipoServico.map(servicoId => {
                            const servico = servicos.find(s => s.id === servicoId);
                            return servico ? (
                              <Tag key={servicoId} color="blue" className="mr-1 mb-1">{servico.titulo}</Tag>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Delete button at the bottom */}
                  <div className="text-right mt-2">
                    <Button 
                      color="red" 
                      size={window.innerWidth < 768 ? "md" : "sm"}
                      style={{ padding: window.innerWidth < 768 ? '8px 12px' : undefined }}
                      onClick={() => confirmDeleteSchedule(schedule)}
                    >
                      <Icon icon="trash" /> Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal para adicionar horário */}
          <CustomModal
            show={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              resetNewSchedule();
            }}
            title="Adicionar Novo Horário"
            size="sm"
            primaryActionLabel="Salvar"
            primaryActionIcon="save"
            primaryActionDisabled={loading || newSchedule.dias.length === 0}
            onPrimaryAction={saveSchedule}
            secondaryActionLabel="Cancelar"
            loading={loading}
          >
            <div className="form-group mb-3">
              <label>Dias da Semana</label>
              <CheckPicker
                data={daysOfWeek}
                value={newSchedule.dias}
                onChange={value => {
                  // Ensure value is always treated as an array
                  const diasArray = Array.isArray(value) ? value : value ? [value] : [];
                  setNewSchedule({...newSchedule, dias: diasArray});
                }}
                placeholder="Selecione os dias"
                block
              />
            </div>
            <div className="form-group mb-3">
              <label>Horário de Início</label>
              <DatePicker
                format="HH:mm"
                value={newSchedule.inicio}
                onChange={value => setNewSchedule({...newSchedule, inicio: value})}
                hideHours={hour => hour < 6 || hour > 23}
                ranges={[
                  {
                    label: 'Manhã',
                    value: new Date('2025-01-01T08:00:00.000Z')
                  },
                  {
                    label: 'Tarde',
                    value: new Date('2025-01-01T13:00:00.000Z')
                  }
                ]}
                block
              />
            </div>
            <div className="form-group mb-3">
              <label>Horário de Término</label>
              <DatePicker
                format="HH:mm"
                value={newSchedule.fim}
                onChange={value => setNewSchedule({...newSchedule, fim: value})}
                hideHours={hour => hour < 6 || hour > 23}
                ranges={[
                  {
                    label: 'Meio-dia',
                    value: new Date('2025-01-01T12:00:00.000Z')
                  },
                  {
                    label: 'Fim de tarde',
                    value: new Date('2025-01-01T18:00:00.000Z')
                  }
                ]}
                block
              />
            </div>
            {servicos.length > 0 && (
              <div className="form-group mb-3">
                <label>Serviços Aplicáveis (opcional)</label>
                <CheckPicker
                  data={servicos.map(s => ({ label: s.titulo, value: s.id }))}
                  value={newSchedule.tipoServico}
                  onChange={value => {
                    // Ensure value is always treated as an array
                    const tipoServicoArray = Array.isArray(value) ? value : value ? [value] : [];
                    setNewSchedule({...newSchedule, tipoServico: tipoServicoArray});
                  }}
                  placeholder="Selecione os serviços"
                  block
                />
              </div>
            )}
            
            <div className="form-group mb-0">
              <label className="d-flex justify-content-between align-items-center">
                <span>Status</span>
                <Toggle
                  checked={newSchedule.status === 'A'}
                  onChange={checked => setNewSchedule({...newSchedule, status: checked ? 'A' : 'I'})}
                  checkedChildren="Ativo"
                  unCheckedChildren="Inativo"
                  size="md"
                />
              </label>
              <div className="help-text text-muted small mt-1">
                {newSchedule.status === 'A' 
                  ? "O horário será usado para agendamentos assim que criado." 
                  : "O horário será salvo como inativo e poderá ser ativado posteriormente."}
              </div>
            </div>
          </CustomModal>

          {/* Modal de confirmação de exclusão */}
          <CustomModal
            show={showConfirmDelete}
            onClose={() => setShowConfirmDelete(false)}
            title="Confirmar Exclusão"
            size="xs"
            primaryActionLabel="Sim, excluir"
            primaryActionColor="red"
            primaryActionDisabled={loading}
            onPrimaryAction={deleteSchedule}
            secondaryActionLabel="Cancelar"
            loading={loading}
          >
            <div className="text-center">
              <Icon
                icon="remind"
                style={{ color: '#ffb300', fontSize: 24 }}
              />
              <p className="mt-3">Tem certeza que deseja excluir este horário?</p>
              <p className="text-danger">Esta ação não pode ser desfeita.</p>
            </div>
          </CustomModal>

          {/* Modal de confirmação para ativar horário */}
          <CustomModal
            show={showConfirmActivate}
            onClose={() => setShowConfirmActivate(false)}
            title="Confirmar Ativação"
            size="md"
            primaryActionLabel="Sim, ativar"
            primaryActionColor="green"
            primaryActionDisabled={statusLoading === (scheduleToToggle?._id) || hasConflict}
            onPrimaryAction={activateSchedule}
            secondaryActionLabel="Cancelar"
            loading={statusLoading === (scheduleToToggle?._id)}
          >
            <div className="text-center mb-4">
              <Icon
                icon="remind"
                style={{ color: '#ffb300', fontSize: 24 }}
              />
              <p className="mt-3">Deseja ativar este horário?</p>
              {hasConflict ? (
                <div className="alert alert-danger mt-2">
                  <Icon icon="close-circle" /> 
                  <strong>Não é possível ativar este horário</strong>
                  <p className="mb-0 mt-1">
                    Existem conflitos nos dias: {conflictingDays.map(day => {
                      const dayObj = daysOfWeek.find(d => d.value === day);
                      return dayObj ? dayObj.label : day;
                    }).join(', ')}
                  </p>
                </div>
              ) : (
                <p className="text-warning mb-1">
                  Se este horário conflitar com outros horários ativos, a ativação não será possível.
                </p>
              )}
              <p className="small text-muted">
                Horários ativos não podem compartilhar os mesmos dias da semana.
              </p>
            </div>
            
            {scheduleToToggle && (
              <div className="mb-4 p-3 bg-light rounded border-left border-primary" style={{borderLeftWidth: '5px'}}>
                <h6>Horário a ser ativado:</h6>
                <p className="mb-1"><strong>Dias:</strong> {formatDays(scheduleToToggle.dias)}</p>
                <p className="mb-0"><strong>Horário:</strong> {formatTime(scheduleToToggle.inicio)} - {formatTime(scheduleToToggle.fim)}</p>
              </div>
            )}
            
            {/* Mostrar horários ativos existentes para facilitar a visualização de potenciais conflitos */}
            <div>
              <h6 className="mb-3">Horários atualmente ativos:</h6>
              {schedules.filter(s => s.status === 'A' && (!scheduleToToggle || s._id !== scheduleToToggle._id)).length === 0 ? (
                <p className="text-muted">Nenhum outro horário ativo.</p>
              ) : (
                <div className="active-schedules-list">
                  {schedules
                    .filter(s => s.status === 'A' && (!scheduleToToggle || s._id !== scheduleToToggle._id))
                    .map((schedule, i) => (
                      <div 
                        key={i} 
                        className="p-2 mb-2 border-bottom"
                        style={{
                          backgroundColor: scheduleToToggle && 
                              scheduleToToggle.dias.some(day => schedule.dias.includes(day)) 
                              ? '#f8d7da' : 'transparent',
                          borderLeft: scheduleToToggle && 
                              scheduleToToggle.dias.some(day => schedule.dias.includes(day))
                              ? '3px solid #dc3545' : 'none',
                          paddingLeft: scheduleToToggle && 
                              scheduleToToggle.dias.some(day => schedule.dias.includes(day))
                              ? '10px' : '0'
                        }}
                      >
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>{formatDays(schedule.dias)}</strong>
                          </div>
                          <div>{formatTime(schedule.inicio)} - {formatTime(schedule.fim)}</div>
                        </div>
                        {scheduleToToggle && scheduleToToggle.dias.some(day => schedule.dias.includes(day)) && (
                          <div className="text-warning small mt-1">
                            <Icon icon="close-circle" style={{ color: '#dc3545' }} /> Conflito de dias detectado
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </CustomModal>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManager;