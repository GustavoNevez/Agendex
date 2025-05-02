import React, { useEffect, useState, useContext } from 'react';
import 'moment/locale/pt-br';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { 
    filtroAgendamento, 
    fetchServicos, 
    fetchClientes, 
    fetchProfissionais, 
    fetchDiasDisponiveis,
    fetchDiasDisponiveisProfissional,
    saveAgendamento, 
    deleteAgendamento, 
    finalizeAgendamento, 
    updateAgendamento,
    fetchProximosSeteDias
} from '../../store/modules/agendamento/actions';
import { fetchTurnos } from '../../store/modules/turno/actions';
import { filterTimesByBusinessHours } from '../../utils/turnos';
import util from '../../util';
import { Button, SelectPicker, DatePicker, Modal, Icon, Panel } from 'rsuite';
import { AuthContext } from '../../context/auth';
import { useAgendamento } from '../../context/agendamentoContext';
import { MoreVertical } from 'lucide-react';
import CustomModal, { WarningModal } from '../../components/Modal';
import CustomDrawer from '../../components/CustomDrawer';

const Agendamentos = () => {
    const dispatch = useDispatch();
    const { agendamentos, agendamentosSemana, servicos, diasDisponiveis, clientes, profissionais } = useSelector((state) => state.agendamento);
    const { turnos } = useSelector((state) => state.turno);
    const { isModalOpen, closeModal } = useAgendamento();
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(moment().toDate());
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    
    // Loading states
    const [isCalendarLoading, setIsCalendarLoading] = useState(true);
    const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(true);
    const [isServicesLoading, setIsServicesLoading] = useState(true);
    const [isClientsLoading, setIsClientsLoading] = useState(true);
    const [isProfessionalsLoading, setIsProfessionalsLoading] = useState(true);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [filteredProfessionals, setFilteredProfessionals] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [confirmSave, setConfirmSave] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmFinalize, setConfirmFinalize] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(moment());
    const [view, setView] = useState("Diário");
    // Fetch appointments for next 7 days when view is set to "Semanal"
    useEffect(() => {
        if (view === "Semanal") {
            const storedUser = localStorage.getItem("@Auth:user");
            const user = JSON.parse(storedUser);
            dispatch(fetchProximosSeteDias(user.id));
        }
    }, [view, dispatch]);
    // Time zone adjustment helper functions
    const adjustTimeFromServer = (serverTime) => {
        // Add 4 hours to convert from server time (US Western, approx. UTC-7) to Brazil time (UTC-3)
        // The difference is approximately 4 hours (could be 4 or 5 depending on daylight saving time)
        return moment(serverTime).add(3, 'hours');
    };
    
    const adjustTimeToServer = (localTime) => {
        // Subtract 4 hours to convert from Brazil time (UTC-3) to server time (US Western, approx. UTC-7)
        // The difference is approximately 4 hours (could be 4 or 5 depending on daylight saving time)
        return moment(localTime).subtract(3, 'hours');
    };

    // Escutar por mudanças no estado do modal no contexto
    useEffect(() => {
        if (isModalOpen) {
            handleAddAppointment();
            closeModal();
        }
    }, [isModalOpen, closeModal]);

    useEffect(() => {
        setIsServicesLoading(true);
        setIsClientsLoading(true);
        setIsProfessionalsLoading(true);
        setIsAppointmentsLoading(true);
        
        dispatch(fetchServicos());
        dispatch(fetchClientes());
        dispatch(fetchProfissionais());
        dispatch(fetchTurnos());
        dispatch(filtroAgendamento(
            moment().startOf('month').format('YYYY-MM-DD'),
            moment().endOf('month').format('YYYY-MM-DD')
        ));
    }, [dispatch]);
    
    // Update loading states when data is available
    useEffect(() => {
        if (servicos.length > 0) {
            setIsServicesLoading(false);
        }
    }, [servicos]);

    useEffect(() => {
        if (clientes.length > 0) {
            setIsClientsLoading(false);
        }
    }, [clientes]);

    useEffect(() => {
        if (profissionais.length > 0) {
            setIsProfessionalsLoading(false);
        }
    }, [profissionais]);

    // Filtra os profissionais baseado no serviço selecionado
    useEffect(() => {
        if (selectedService && profissionais.length > 0) {
            // Filtra apenas profissionais que oferecem o serviço selecionado
            const profissionaisDoServico = profissionais.filter(profissional => 
                profissional.servicosId && profissional.servicosId.includes(selectedService)
            );
            setFilteredProfessionals(profissionaisDoServico);
            
            // Limpa o profissional selecionado se ele não oferece o serviço
            if (selectedProfessional && !profissionaisDoServico.some(p => p.id === selectedProfessional)) {
                setSelectedProfessional(null);
            }
        } else if (!selectedService) {
            // Se não há serviço selecionado, mostra todos os profissionais
            setFilteredProfessionals(profissionais);
        }
    }, [selectedService, profissionais, selectedProfessional]);

    // Filtra os serviços baseado no profissional selecionado
    useEffect(() => {
        if (selectedProfessional && servicos.length > 0) {
            // Encontra o profissional selecionado
            const profissionalSelecionado = profissionais.find(p => p.id === selectedProfessional);
            
            // Filtra apenas serviços que o profissional pode realizar
            if (profissionalSelecionado && profissionalSelecionado.servicosId) {
                const servicosDoProfissional = servicos.filter(servico => 
                    profissionalSelecionado.servicosId.includes(servico.id)
                );
                setFilteredServices(servicosDoProfissional);
                
                // Limpa o serviço selecionado se o profissional não o oferece
                if (selectedService && !profissionalSelecionado.servicosId.includes(selectedService)) {
                    setSelectedService(null);
                    setSelectedPrice(null);
                }
            } else {
                setFilteredServices([]);
            }
        } else if (!selectedProfessional) {
            // Se não há profissional selecionado, mostra todos os serviços
            setFilteredServices(servicos);
        }
    }, [selectedProfessional, servicos, profissionais, selectedService]);

    // Fetch available days and times when service, date AND professional changes
    useEffect(() => {
            // Only fetch available times when all three are selected
            if (selectedService && selectedDate && selectedProfessional) {
                const storedUser = localStorage.getItem("@Auth:user");
                const user = JSON.parse(storedUser);
                
                // Reset selected time when any of these dependencies change
                setSelectedTime(null);
                setAvailableTimes([]);
                
                console.log("Fetching available times with:", {
                    estabelecimentoId: user.id,
                    date: moment(selectedDate).format('YYYY-MM-DD'),
                    servicoId: selectedService,
                    profissionalId: selectedProfessional
                });
                
                // Use fetchDiasDisponiveisProfissional when we have a professional ID
                dispatch(fetchDiasDisponiveisProfissional(
                    user.id, 
                    moment(selectedDate).format('YYYY-MM-DD'), 
                    selectedService,
                    selectedProfessional
                ));
        } else if (!selectedProfessional) {
            // Clear available times if no professional is selected
            setSelectedTime(null);
            setAvailableTimes([]);
        }
    }, [selectedService, selectedDate, selectedProfessional, dispatch]);

    // Process available times from agendamento/horarios-disponiveis API
    useEffect(() => {
        if (selectedDate) {
            const selectedDay = moment(selectedDate).format('YYYY-MM-DD');
            
            try {
                // Find available times for the selected day in the diasDisponiveis data
                const availableTimesForDay = diasDisponiveis.find(dia => dia[selectedDay]);
                
                if (availableTimesForDay) {
                    const times = availableTimesForDay[selectedDay];
                    
                    // Process times to ensure we don't have duplicates
                    let processedTimes = [];
                    
                    if (Array.isArray(times)) {
                        // Check if times is an array of arrays or just a simple array
                        if (times.length > 0 && Array.isArray(times[0])) {
                            // It's an array of arrays, extract the first item from each inner array
                            processedTimes = times.map(t => t[0]);
                        } else {
                            // It's a simple array, use as is
                            processedTimes = times;
                        }
                        
                        // Remove any duplicates
                        processedTimes = [...new Set(processedTimes)];
                    }
                    
                    // Sort times chronologically for better display
                    processedTimes.sort((a, b) => {
                        const timeA = moment(`2000-01-01T${a}`);
                        const timeB = moment(`2000-01-01T${b}`);
                        return timeA.diff(timeB);
                    });
                    
                    // Log available times for debugging
                    console.log(`Day ${selectedDay}: ${processedTimes.length} available times`);
                    
                    // First filter by conflicts with existing appointments
                    const horariosSemConflito = filtrarHorariosDisponiveis(processedTimes, agendamentos);
                    
                    // Then filter by business hours (turnos)
                    const horariosFiltrados = filterTimesByBusinessHours(
                        horariosSemConflito, 
                        selectedDate, 
                        turnos
                    );
                    
                    setAvailableTimes(horariosFiltrados);
                } else {
                    // No times available for this day
                    console.log(`No available times for day ${selectedDay}`);
                    setAvailableTimes([]);
                }
            } catch (error) {
                console.error('Error processing available times:', error);
                setAvailableTimes([]);
            }
        }
    }, [diasDisponiveis, selectedDate, turnos, agendamentos]);

    const filtrarHorariosDisponiveis = (horariosDisponiveis, agendamentosExistentes) => {
        // Filter out times that conflict with existing appointments for the selected professional
        return horariosDisponiveis.filter(horario => {
            const horarioMoment = moment(horario, 'HH:mm');
            const horarioComData = moment(selectedDate).set({
                hour: horarioMoment.hour(),
                minute: horarioMoment.minute(),
                second: 0,
            });
            
            // Only check appointments for the selected professional
            const appointmentsForSelectedProfessional = selectedProfessional ? 
                agendamentosExistentes.filter(agendamento => 
                    (agendamento.profissionalId === selectedProfessional || 
                    (typeof agendamento.profissionalId === 'object' && 
                     agendamento.profissionalId.toString() === selectedProfessional))
                ) : [];
            
            return !appointmentsForSelectedProfessional.some(agendamento => {
                // Adjust for timezone difference when comparing
                const inicio = adjustTimeFromServer(agendamento.data);
                const final = inicio.clone().add(agendamento.duracao, 'minutes');
                
            // Check if the time slot is between start and end of an appointment
            // Using closed interval '[]' to include the exact end time
            // This allows appointments that end exactly at closing time to be valid
            return horarioComData.isBetween(inicio, final, undefined, '[]');
            });
        });
    };
      
    
    // Debug: Log available days from diasDisponiveis whenever it changes
    useEffect(() => {
        if (diasDisponiveis && diasDisponiveis.length > 0) {
            const availableDays = diasDisponiveis.map(dayObj => {
                const day = Object.keys(dayObj)[0];
                const times = dayObj[day];
                return { day, timeCount: times.length };
            });
            
            console.log('Available days with times:', availableDays);
            console.log('Total days with available times:', availableDays.length);
        }
    }, [diasDisponiveis]);
    
    // Ensure appointments are refreshed whenever the current month changes
    useEffect(() => {
        setIsAppointmentsLoading(true);
        const start = moment(currentMonth).startOf('month').format('YYYY-MM-DD');
        const end = moment(currentMonth).endOf('month').format('YYYY-MM-DD');
        dispatch(filtroAgendamento(start, end));
    }, [currentMonth, dispatch]);
    
    // Update appointments loading state when data is available
    useEffect(() => {
        if (agendamentos.length >= 0) {
            // We use >= 0 because even empty array means loading is complete
            setIsAppointmentsLoading(false);
            setIsCalendarLoading(false);
        }
    }, [agendamentos]);

    const handleAddAppointment = () => {
        setSelectedAppointment(null);
        setSelectedService(null);
        setSelectedDate(moment().toDate());
        setSelectedTime(null);
        setSelectedClient(null);
        setSelectedPrice(null);
        setSelectedProfessional(null);
        setDrawerOpen(true);
    };

    const handleSaveAppointment = () => {
        setConfirmSave(true);
    };

    const confirmSaveAppointment = () => {
        if (selectedService && selectedDate && selectedTime && selectedClient && selectedProfessional) {
            const storedUser = localStorage.getItem("@Auth:user");
            const user = JSON.parse(storedUser);
            
            // Create date from selected date and time
            const localDateTime = moment(`${moment(selectedDate).format('YYYY-MM-DD')}T${selectedTime}`);
            
            // Log for debugging timezone conversion
            console.log('Local Brazil time (selected):', localDateTime.format('YYYY-MM-DD HH:mm'));
            
            // Adjust to server time (subtract 4 hours) before sending to the server
            const serverDateTime = adjustTimeToServer(localDateTime);
            console.log('Converted to server time:', serverDateTime.format('YYYY-MM-DD HH:mm'));
            
            const agendamento = {
                estabelecimentoId: user.id,
                data: serverDateTime.toISOString(),
                servicoId: selectedService,
                clienteId: selectedClient,
                valor: selectedPrice,
                profissionalId: selectedProfessional,
            };
            
            // First close the confirmation modal
            setConfirmSave(false);
            
            // Then dispatch the action
            dispatch(saveAgendamento(agendamento));
            
            // Close the drawer after a short delay to allow toast notification to render first
            setTimeout(() => {
                setDrawerOpen(false);
                
                // Refresh appointments data after another delay
                setTimeout(() => {
                    handleUpdateAppointments();
                }, 500);
            }, 100);
        }
    };

    const handleDeleteAppointment = () => {
        setConfirmDelete(true);
    };

    const handleFinalizeAppointment = () => {
        setConfirmFinalize(true);
    };

    const confirmDeleteAppointment = () => {
        if (selectedAppointment) {
            // First close the confirmation modal
            setConfirmDelete(false);
            
            // Then dispatch the action
            dispatch(deleteAgendamento(selectedAppointment._id));
            
            // Close the drawer after a short delay to allow toast notification to render first
            setTimeout(() => {
                setDrawerOpen(false);
                
                // Refresh appointments data after another delay
                setTimeout(() => {
                    handleUpdateAppointments();
                }, 500);
            }, 100);
        }
    };

    const confirmFinalizeAppointment = () => {
        if (selectedAppointment) {
            // First close the confirmation modal
            setConfirmFinalize(false);
            
            // Then dispatch the action
            dispatch(finalizeAgendamento(selectedAppointment._id));
            
            // Close the drawer after a short delay to allow toast notification to render first
            setTimeout(() => {
                setDrawerOpen(false);
                
                // Refresh appointments data after another delay
                setTimeout(() => {
                    handleUpdateAppointments();
                }, 500);
            }, 100);
        }
    };

    const handleUpdateAppointments = () => {
        // Use the currently selected month view instead of always using the current date
        const start = moment(currentMonth).startOf('month').format('YYYY-MM-DD');
        const end = moment(currentMonth).endOf('month').format('YYYY-MM-DD');
        dispatch(filtroAgendamento(start, end));
    };

    const handleSelectEvent = (event) => {
        setSelectedAppointment(event);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setSelectedAppointment(null);
        setSelectedService(null);
        // Don't reset the selectedDate to maintain the appointment view
        setSelectedTime(null);
        setSelectedClient(null);
        setSelectedPrice(null);
        setSelectedProfessional(null);
        setDrawerOpen(false);
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        
        // Check if the date is in a different month than the currently loaded data
        const selectedMonth = moment(date).format('YYYY-MM');
        const currentLoadedMonth = moment(currentMonth).format('YYYY-MM');
        
        if (selectedMonth !== currentLoadedMonth) {
            // Update the current month view
            setCurrentMonth(moment(date));
        }
        
        // Always fetch appointments when a date is clicked, regardless of month change
        // This ensures the appointment list is always refreshed
        const start = moment(date).startOf('day').format('YYYY-MM-DD');
        const end = moment(date).endOf('day').format('YYYY-MM-DD');
        dispatch(filtroAgendamento(start, end));
    };

    const prevMonth = () => {
        const newMonth = moment(currentMonth).subtract(1, 'month');
        setCurrentMonth(newMonth);
        
        // Fetch appointments for the new month
        const start = newMonth.startOf('month').format('YYYY-MM-DD');
        const end = newMonth.endOf('month').format('YYYY-MM-DD');
        dispatch(filtroAgendamento(start, end));
    };

    const nextMonth = () => {
        const newMonth = moment(currentMonth).add(1, 'month');
        setCurrentMonth(newMonth);
        
        // Fetch appointments for the new month
        const start = newMonth.startOf('month').format('YYYY-MM-DD');
        const end = newMonth.endOf('month').format('YYYY-MM-DD');
        dispatch(filtroAgendamento(start, end));
    };

    // Custom skeleton loading CSS classes
    const skeletonBaseStyle = "animate-pulse bg-gray-200 rounded";
    
    // Render skeleton loading for calendar
    const renderCalendarSkeleton = () => {
        return (
            <div className="calendar-container pt-0 shadow-lg rounded-xl bg-white border border-gray-100 overflow-hidden" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <div className="calendar-header flex justify-between items-center bg-white p-4 border-b border-gray-100">
                    <div className={`w-8 h-8 ${skeletonBaseStyle} rounded-full`}></div>
                    <div className={`w-32 h-5 ${skeletonBaseStyle}`}></div>
                    <div className={`w-8 h-8 ${skeletonBaseStyle} rounded-full`}></div>
                </div>
                <div className="p-2">
                    <div className="mb-2">
                        <div className={`w-full h-6 ${skeletonBaseStyle}`}></div>
                    </div>
                    {[...Array(6)].map((_, rowIndex) => (
                        <div key={`calendar-skeleton-row-${rowIndex}`} className="flex justify-between mb-4">
                            {[...Array(7)].map((_, colIndex) => (
                                <div key={`calendar-skeleton-cell-${rowIndex}-${colIndex}`} className="w-8 mx-1">
                                    <div className={`w-8 h-8 ${skeletonBaseStyle} rounded-full`}></div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render skeleton loading for time slots
    const renderTimeSlotsSkeletons = () => {
        return (
            <div className="time-slots-container bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4">
                    <div className="view-toggles flex mb-4 w-full ">
                        <div className={`flex-1 h-9 ${skeletonBaseStyle} rounded-full mr-1`}></div>
                        <div className={`flex-1 h-9 ${skeletonBaseStyle} rounded-full ml-1`}></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className={`w-48 h-6 ${skeletonBaseStyle}`}></div>
                    </div>
                </div>
                
                <div className="time-slots p-4">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, index) => (
                            <div 
                                key={`appointment-skeleton-${index}`}
                                className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden"
                            >
                                <div className="flex items-center border-l-4 border-gray-200">
                                    <div className="bg-gray-50 p-3 sm:p-4 flex flex-col items-center justify-center min-w-[60px] sm:min-w-[90px]">
                                        <div className={`w-14 h-6 ${skeletonBaseStyle}`}></div>
                                    </div>
                                    
                                    <div className="flex-1 p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className={`w-20 h-5 ${skeletonBaseStyle} mb-2 rounded-full`}></div>
                                                <div className={`w-32 h-6 ${skeletonBaseStyle}`}></div>
                                            </div>
                                            <div className={`w-6 h-6 ${skeletonBaseStyle} rounded-full`}></div>
                                        </div>
                                        
                                        <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-4 gap-2 mt-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 ${skeletonBaseStyle} rounded-full`}></div>
                                                <div className={`w-36 h-4 ${skeletonBaseStyle}`}></div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 ${skeletonBaseStyle} rounded-full`}></div>
                                                <div className={`w-36 h-4 ${skeletonBaseStyle}`}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };
    
    // Render skeleton loading for drawer fields
    const renderDrawerFieldsSkeleton = () => {
        return (
            <div className="mt-3 space-y-3">
                <div className="mb-3">
                    <label className="block font-medium mb-1"><b>Serviços</b></label>
                    <div className={`w-full h-10 ${skeletonBaseStyle}`}></div>
                </div>
                <div className="mb-3">
                    <label className="block font-medium mb-1"><b>Profissionais</b></label>
                    <div className={`w-full h-10 ${skeletonBaseStyle}`}></div>
                </div>
                <div className="mb-3">
                    <label className="block font-medium mb-1"><b>Clientes</b></label>
                    <div className={`w-full h-10 ${skeletonBaseStyle}`}></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="mb-3">
                        <label className="block font-medium mb-1"><b>Data</b></label>
                        <div className={`w-full h-10 ${skeletonBaseStyle}`}></div>
                    </div>
                    <div className="mb-3">
                        <label className="block font-medium mb-1"><b>Horário</b></label>
                        <div className={`w-full h-10 ${skeletonBaseStyle}`}></div>
                    </div>
                </div>

                <div className="flex flex-col mt-4 space-y-2">
                    <div className={`w-full h-10 ${skeletonBaseStyle}`}></div>
                </div>
            </div>
        );
    };

    const renderCalendar = () => {
        const monthStart = moment(currentMonth).startOf('month');
        const monthEnd = moment(currentMonth).endOf('month');
        const startDate = moment(monthStart).startOf('week');
        const endDate = moment(monthEnd).endOf('week');

        const rows = [];
        let days = [];
        let day = startDate;

        // Render weekday headers
        const weekdayShort = moment.weekdaysShort();
        const weekdayHeader = weekdayShort.map(day => (
            <th key={day} className="text-center p-0.5 sm:p-1 md:p-2">
                <span className="text-[10px] xs:text-xs md:text-sm font-medium text-gray-500 hidden xs:inline">
                    {day.substring(0, 3).toUpperCase()}
                </span>
                <span className="text-[10px] font-medium text-gray-500 xs:hidden">
                    {day.substring(0, 1).toUpperCase()}
                </span>
            </th>
        ));

        // Render calendar cells
        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = moment(day);
                const formattedDate = cloneDay.format('D');
                const isCurrentMonth = cloneDay.month() === currentMonth.month();
                const isSelected = moment(selectedDate).isSame(cloneDay, 'day');
                const isToday = cloneDay.isSame(moment(), 'day');

                // Count appointments for this day - for the dot indicator
                const appointmentsToday = isCurrentMonth ? agendamentos.filter(a => {
                    const appointmentLocalDate = adjustTimeFromServer(a.data);
                    return appointmentLocalDate.format('YYYY-MM-DD') === cloneDay.format('YYYY-MM-DD');
                }).length : 0;

                days.push(
                    <td key={cloneDay.format('YYYY-MM-DD')} className="text-center p-0 xs:p-0.5 md:p-1 relative">
                        <button
                            className={`w-8 h-8 sm:w-7 sm:h-7 md:w-7 md:h-7 lg:w-10 lg:h-10 rounded-full mx-auto text-xs md:text-sm font-medium transition-all duration-200 ${
                                isSelected ? 'bg-indigo-600 text-white shadow-md' : 
                                isToday ? 'border-2 border-indigo-500 text-indigo-600' : 
                                isCurrentMonth ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300'
                            }`}
                            onClick={() => handleDateClick(cloneDay.toDate())}
                            disabled={!isCurrentMonth}
                        >
                            {formattedDate}
                        </button>
                        
                    </td>
                );
                day = moment(day).add(1, 'day');
            }
            rows.push(<tr key={day.format('YYYY-MM-DD-row')}>{days}</tr>);
            days = [];
        }

        return (
            <div className="calendar-container pt-0 shadow-lg rounded-xl bg-white border border-gray-100 overflow-hidden" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <div className="calendar-header  flex justify-between items-center bg-white p-4 border-b border-gray-100">
                    <button 
                        onClick={prevMonth} 
                        className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                    </button>
                    <div className="font-bold text-base text-gray-800">
                        {currentMonth.format('MMMM YYYY')}
                    </div>
                    <button 
                        onClick={nextMonth} 
                        className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6"/>
                        </svg>
                    </button>
                </div>
                <table className="calendar-table w-full border-collapse table-fixed">
                    <thead className="bg-gray-50">
                        <tr>{weekdayHeader}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">{rows}</tbody>
                </table>
            </div>
        );
    };

    const renderTimeSlots = () => {
        const date = moment(selectedDate);
        const dateStr = date.format('DD/MM');
        const today = moment(selectedDate).format('YYYY-MM-DD');
        
        // Find appointments for this date - adjust for timezone (-3 hours)
        const dayAppointments = agendamentos.filter(a => {
            // Adjust the appointment time to local time
            const localAppointmentDate = adjustTimeFromServer(a.data);
            return localAppointmentDate.format('YYYY-MM-DD') === today;
        });

        // Sort appointments by time
        dayAppointments.sort((a, b) => {
            const timeA = adjustTimeFromServer(a.data);
            const timeB = adjustTimeFromServer(b.data);
            return timeA.diff(timeB);
        });

        return (
            <div className="time-slots-container bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4">
                <div className="view-toggles flex mb-4 w-full rounded-full border border-indigo-600 overflow-hidden ">

                <button
    className={`flex-1 px-3 md:px-5 py-2 text-sm font-medium rounded-l-full transition-all duration-200 ${
        view === 'Diário'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-indigo-100 text-indigo-700'
    }`}
    onClick={() => setView('Diário')}
>

        <span className="flex items-center justify-center gap-1 md:gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span className="text-xs md:text-sm">Diário</span>
        </span>
    </button>
    <button
    className={`flex-1 px-3 md:px-5 py-2 text-sm font-medium rounded-r-full transition-all duration-200 ${
        view === 'Semanal'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-indigo-100 text-indigo-700'
    }`}
    onClick={() => setView('Semanal')}
>
        <span className="flex items-center justify-center gap-1 md:gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span className="text-xs md:text-sm">Semanal</span>
        </span>
    </button>
</div>
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800">
                            {dateStr} - {date.format('dddd')}
                        </h3>
                    </div>
                </div>
                
                <div className="time-slots p-4">
                    {view === 'Diário' ? (
                        // Daily View
                        dayAppointments.length === 0 ? (
                            <div className="text-center p-8 bg-gray-50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <p className="mt-4 text-gray-500 font-medium">Nenhum agendamento para esta data</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {dayAppointments.map(appointment => {
                                    // Use the simplified data structure if available, fall back to old structure if needed
                                    const service = appointment.servico || 
                                        (appointment.servicoId && appointment.servicoId.length > 0 
                                            ? appointment.servicoId[0] 
                                            : { titulo: 'Serviço' });
                                    
                                    const client = appointment.cliente || 
                                        (appointment.clienteId && appointment.clienteId.length > 0 
                                            ? appointment.clienteId[0] 
                                            : { nome: 'Cliente' });
                                    
                                    // Improved professional name lookup logic for daily view
                                    let professionalName = 'Profissional';
                                    
                                    // Method 1: Get from profissional object if exists (used by weekly view)
                                    if (appointment.profissional && appointment.profissional.nome) {
                                        professionalName = appointment.profissional.nome;
                                    } 
                                    // Method 2: Direct lookup from the appointment if stored there
                                    else if (appointment.profissionalNome) {
                                        professionalName = appointment.profissionalNome;
                                    } 
                                    // Method 3: Find the professional from profissionais list using ID
                                    // The daily view endpoint doesn't populate profissionalId, but we can use the raw ID
                                    else if (appointment.profissionalId) {
                                        // If profissionalId is a string ID, look it up in the profissionais array
                                        const foundProfessional = profissionais.find(p => 
                                            p.id === appointment.profissionalId || 
                                            (typeof appointment.profissionalId === 'object' && p.id === appointment.profissionalId.toString())
                                        );
                                        
                                        if (foundProfessional && foundProfessional.nome) {
                                            professionalName = foundProfessional.nome;
                                        }
                                    }
                                    
                                    // Format appointment time
                                    const appointmentTime = adjustTimeFromServer(appointment.data);
                                    
                                    return (
                                        <div 
                                            key={appointment._id || `appointment-${appointmentTime.format('HH-mm')}`}
                                            className="bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer"
                                            onClick={() => handleSelectEvent(appointment)}
                                        >
                                            <div className="flex items-center border-l-4 border-indigo-500">
                                                <div className="bg-indigo-50 p-3 sm:p-4 flex flex-col items-center justify-center min-w-[60px] sm:min-w-[90px]">
                                                    <span className="text-xl font-bold text-indigo-700">{appointmentTime.format('HH:mm')}</span>
                                                </div>
                                                
                                                <div className="flex-1 p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full mb-2">
                                                                Confirmado
                                                            </span>
                                                            <h3 className="font-bold text-lg text-gray-800">{service.titulo}</h3>
                                                        </div>
                                                        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <circle cx="12" cy="12" r="1"></circle>
                                                                <circle cx="19" cy="12" r="1"></circle>
                                                                <circle cx="5" cy="12" r="1"></circle>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-4 gap-2 mt-2">
                                                        <div className="flex items-center gap-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                                <circle cx="12" cy="7" r="4"></circle>
                                                            </svg>
                                                            <p className="font-medium text-gray-700 text-sm sm:text-base truncate">
                                                                Cliente: <span className="font-semibold">{client.nome}</span>
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                                                <path d="M12 3v4"></path>
                                                                <path d="M8 7h8"></path>
                                                                <circle cx="12" cy="11" r="2"></circle>
                                                            </svg>
                                                            <p className="font-medium text-gray-700 text-sm sm:text-base truncate">
                                                                Profissional: <span className="font-semibold">{professionalName}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        // Weekly View
                        <div className="space-y-6">
                            {agendamentosSemana.length > 0 ? (
                                // Group appointments by day
                                Object.entries(agendamentosSemana.reduce((days, appointment) => {
                                    const dayDate = moment(appointment.data).format('YYYY-MM-DD');
                                    if (!days[dayDate]) days[dayDate] = [];
                                    days[dayDate].push(appointment);
                                    return days;
                                }, {})).map(([dayDate, appointments]) => {
                                    const dayMoment = moment(dayDate);
                                    const dayStr = dayMoment.format('DD/MM');
                                    const dayName = dayMoment.format('dddd');
                                    const isToday = dayMoment.isSame(moment(), 'day');
                                    
                                    // Sort appointments by time
                                    appointments.sort((a, b) => {
                                        return moment(a.data).diff(moment(b.data));
                                    });
                                
                                return (
                                    <div key={`day-${dayDate}`} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="bg-gray-50 p-3 border-b border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-bold text-gray-800">
                                                    {dayStr} - {dayName}
                                                </h3>
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    isToday ? 'bg-blue-100 text-blue-800' : ''
                                                }`}>
                                                    {isToday ? 'Hoje' : ''}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="p-3">
                                            {appointments.length === 0 ? (
                                                <div className="text-center py-4">
                                                    <p className="text-gray-500">Nenhum agendamento para esta data</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {appointments.map(appointment => {
                                                        // Use the simplified data structure provided by the backend
                                                        const service = appointment.servico || { titulo: 'Serviço' };
                                                        const client = appointment.cliente || { nome: 'Cliente' };
                                                        const professionalName = appointment.profissional ? 
                                                            appointment.profissional.nome : 'Profissional';
                                                        
                                                        // Apply the same timezone adjustment as the daily view
                                                        const appointmentTime = adjustTimeFromServer(appointment.data);
                                                        
                                                        return (
                                                            <div 
                                                                key={appointment._id || `appointment-${appointmentTime.format('HH-mm')}`}
                                                                className="bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer mb-3"
                                                                onClick={() => handleSelectEvent(appointment)}
                                                            >
                                                                <div className="flex items-center border-l-4 border-indigo-500">
                                                                    <div className="bg-indigo-50 p-3 flex flex-col items-center justify-center min-w-[70px]">
                                                                        <span className="text-lg font-bold text-indigo-700">{appointmentTime.format('HH:mm')}</span>
                                                                    </div>
                                                                    
                                                                    <div className="flex-1 p-3">
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <div>
                                                                                <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full mb-1">
                                                                                    Confirmado
                                                                                </span>
                                                                                <h3 className="font-bold text-gray-800">{service.titulo}</h3>
                                                                            </div>
                                                                        </div>
                                                                        
                                                        <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-2 gap-1 mt-1">
                                                                            <div className="flex items-center gap-1">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                                                    <circle cx="12" cy="7" r="4"></circle>
                                                                                </svg>
                                                                                <p className="font-medium text-gray-700 text-sm">
                                                                                    Cliente: <span className="font-semibold">{client.nome}</span>
                                                                                </p>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                                                                    <path d="M12 3v4"></path>
                                                                                    <path d="M8 7h8"></path>
                                                                                    <circle cx="12" cy="11" r="2"></circle>
                                                                                </svg>
                                                                                <p className="font-medium text-gray-700 text-sm">
                                                                                    Profissional: <span className="font-semibold">{professionalName}</span>
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                                })
                            ) : (
                                <div className="text-center p-8 bg-gray-50 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    <p className="mt-4 text-gray-500 font-medium">Nenhum agendamento para os próximos 7 dias</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Handle background scrolling when modal opens/closes
    useEffect(() => {
        // Store the original overflow style
        const originalStyle = window.getComputedStyle(document.body).overflow;
        
        if (drawerOpen) {
            // Disable scrolling on the body when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            // Add a small delay before re-enabling scrolling
            // This prevents conflicts with toast notifications
            const scrollTimer = setTimeout(() => {
                // Only re-enable if we're still in a closed state
                if (!drawerOpen) {
                    document.body.style.overflow = 'auto';
                }
            }, 300);
            
            // Clean up the timer if component unmounts or drawer reopens
            return () => clearTimeout(scrollTimer);
        }
        
        // Cleanup function to restore original style when component unmounts
        return () => {
            // Use a small delay to ensure clean transition
            setTimeout(() => {
                document.body.style.overflow = originalStyle;
            }, 100);
        };
    }, [drawerOpen]);

    const isSaveButtonEnabled = selectedService && selectedDate && selectedTime && selectedClient && selectedProfessional;

    const { user } = useContext(AuthContext);

    return (
        <div className="p-4">
            {/* Calendar and Day View Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
                <div className="md:col-span-1 flex flex-col">
                    {isCalendarLoading ? renderCalendarSkeleton() : renderCalendar()}
                    <div className="mt-4" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                        <Button 
                            appearance="primary" 
                            color="green" 
                            size="lg" 
                            block
                            onClick={handleAddAppointment}
                            style={{
                                background: 'linear-gradient(45deg, #4f46e5, #7c3aed)',
                                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
                                transition: 'all 0.3s ease',
                                border: 'none',
                                transform: 'translateY(0)'
                            }}
                            className="hover:shadow-lg hover:translate-y-[-2px]"
                        >
                            <Icon icon="plus" /> Novo Agendamento
                        </Button>
                    </div>
                </div>
                <div className="md:col-span-2">
                    {isAppointmentsLoading ? renderTimeSlotsSkeletons() : renderTimeSlots()}
                </div>
            </div>

            {/* Appointment drawer using our reusable CustomDrawer component */}
            <CustomDrawer
                show={drawerOpen}
                onClose={handleCloseDrawer}
                title={selectedAppointment ? "Informações do Agendamento" : "Adicionar Agendamento"}
                showFooter={false}
                size="md"
            >
                {selectedAppointment ? (
                    (isServicesLoading || isClientsLoading || isProfessionalsLoading) ? (
                        renderDrawerFieldsSkeleton()
                    ) : (
                        <div className="mt-3 space-y-3">
                        <div className="mb-3">
                            <label className="block font-medium mb-1"><b>Cliente</b></label>
                            <p>{selectedAppointment.cliente?.nome || 
                                (selectedAppointment.clienteId && selectedAppointment.clienteId[0]?.nome) || 
                                clientes.find(c => c.id === selectedAppointment.clienteId)?.nome || 
                                'Cliente não identificado'}</p>
                        </div>
                        <div className="mb-3">
                            <label className="block font-medium mb-1"><b>Serviço</b></label>
                            <p>{selectedAppointment.servico?.titulo || 
                                (selectedAppointment.servicoId && selectedAppointment.servicoId[0]?.titulo) || 
                                servicos.find(s => s.id === selectedAppointment.servicoId)?.titulo || 
                                'Serviço não identificado'}</p>
                        </div>
                        <div className="mb-3">
                            <label className="block font-medium mb-1"><b>Profissional</b></label>
                            <p>{selectedAppointment.profissional?.nome || 
                                selectedAppointment.profissionalNome || 
                                (selectedAppointment.profissionalId && profissionais.find(p => 
                                    p.id === selectedAppointment.profissionalId || 
                                    (typeof selectedAppointment.profissionalId === 'object' && p.id === selectedAppointment.profissionalId.toString())
                                )?.nome) || 
                                'Profissional não identificado'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-3">
                                <label className="block font-medium mb-1"><b>Data</b></label>
                                <p>{moment(selectedAppointment.data || selectedAppointment.start).format('DD/MM/YYYY')}</p>
                            </div>
                            <div className="mb-3">
                                <label className="block font-medium mb-1"><b>Horário</b></label>
                                <p>{adjustTimeFromServer(selectedAppointment.data || selectedAppointment.start).format('HH:mm')}</p>
                            </div>
                        </div>

                        <div className="flex flex-col mt-4 space-y-2">
                            <Button 
                                block 
                                size={window.innerWidth < 768 ? "md" : "lg"} 
                                appearance="primary" 
                                color="green" 
                                onClick={handleFinalizeAppointment}
                                style={{
                                    padding: window.innerWidth < 768 ? '8px 12px' : undefined,
                                    fontSize: window.innerWidth < 768 ? '14px' : undefined
                                }}
                            >
                                <Icon icon="check" /> Finalizar Agendamento
                            </Button>
                            <Button 
                                block 
                                size={window.innerWidth < 768 ? "md" : "lg"} 
                                appearance="primary" 
                                color="red" 
                                onClick={handleDeleteAppointment}
                                style={{
                                    padding: window.innerWidth < 768 ? '8px 12px' : undefined,
                                    fontSize: window.innerWidth < 768 ? '14px' : undefined
                                }}
                            >
                                <Icon icon="trash" /> Deletar
                            </Button>
                        </div>
                    </div>
                    )
                ) : (
                    (isServicesLoading || isClientsLoading || isProfessionalsLoading) ? (
                        renderDrawerFieldsSkeleton()
                    ) : (
                        <div className="mt-3 space-y-3">
                        <div className="mb-4">
                            <label className="block font-medium mb-2"><b>Serviços</b></label>
                            <div className="w-full">
                                <SelectPicker
                                    data={(selectedProfessional ? filteredServices : servicos).map(servico => ({
                                        label: servico.titulo,
                                        value: servico.id,
                                    }))}
                                    style={{ 
                                        width: '100%',
                                        display: 'block'
                                    }}
                                    value={selectedService}
                                    onChange={(value) => {
                                        setSelectedService(value);
                                        const selected = servicos.find(servico => servico.id === value);
                                        setSelectedPrice(selected ? selected.preco : null);
                                    }}
                                    placeholder="Todos serviços disponiveis"
                                    menuStyle={{ 
                                        zIndex: 1500,
                                        maxHeight: '300px'
                                    }}
                                    container={() => document.body}
                                    block
                                    appearance="default"
                                    size="md"
                                    cleanable={false}
                                    className="rs-picker-default rs-picker-toggle-wrapper block"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block font-medium mb-2"><b>Profissionais</b></label>
                            <div className="w-full">
                                <SelectPicker
                                    data={(selectedService ? filteredProfessionals : profissionais).map(profissional => ({
                                        label: profissional.nome,
                                        value: profissional.id,
                                    }))}
                                    style={{ 
                                        width: '100%',
                                        display: 'block'
                                    }}
                                    value={selectedProfessional}
                                    onChange={setSelectedProfessional}
                                    placeholder="Selecione um profissional"
                                    menuStyle={{ 
                                        zIndex: 1500,
                                        maxHeight: '300px'
                                    }}
                                    container={() => document.body}
                                    block
                                    appearance="default"
                                    size="md"
                                    cleanable={false}
                                    className="rs-picker-default rs-picker-toggle-wrapper block"
                                />
                            </div>
                            {selectedService && filteredProfessionals.length === 0 && (
                                <small className="text-red-500 mt-1 block">Não há profissionais disponíveis para este serviço</small>
                            )}
                            {selectedProfessional && selectedService && filteredServices.length === 0 && (
                                <small className="text-red-500 mt-1 block">Este profissional não realiza o serviço selecionado</small>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block font-medium mb-2"><b>Clientes</b></label>
                            <div className="w-full">
                                <SelectPicker
                                    data={clientes.map(cliente => ({
                                        label: cliente.nome,
                                        value: cliente.id,
                                    }))}
                                    style={{ 
                                        width: '100%',
                                        display: 'block'
                                    }}
                                    value={selectedClient}
                                    onChange={setSelectedClient}
                                    placeholder="Todos clientes ativos"
                                    menuStyle={{ 
                                        zIndex: 1500,
                                        maxHeight: '300px'
                                    }}
                                    container={() => document.body}
                                    block
                                    appearance="default"
                                    size="md"
                                    cleanable={false}
                                    className="rs-picker-default rs-picker-toggle-wrapper block"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label className="block font-medium mb-2"><b>Data</b></label>
                                <div className="w-full">
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        style={{ 
                                            width: '100%',
                                            display: 'block'
                                        }}
                                        value={selectedDate}
                                        onChange={setSelectedDate}
                                        placeholder="Selecione uma data"
                                        container={() => document.body}
                                        menuStyle={{ 
                                            zIndex: 9999,
                                            position: 'fixed',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                                        }}
                                        block
                                        placement="autoVertical"
                                        cleanable={false}
                                        size="md"
                                        className="rs-picker-default rs-picker-toggle-wrapper block"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium mb-2"><b>Horário</b></label>
                                <div className="w-full">
                                    <SelectPicker
                                        data={availableTimes.map(time => ({
                                            label: time,
                                            value: time,
                                        }))}
                                        style={{ 
                                            width: '100%',
                                            display: 'block'
                                        }}
                                        value={selectedTime}
                                        onChange={setSelectedTime}
                                        placeholder="Selecione um horário"
                                        menuStyle={{ 
                                            zIndex: 9999, 
                                            maxHeight: '300px', 
                                            overflow: 'auto',
                                            position: 'fixed',
                                            width: 'auto',
                                            minWidth: '100%',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                                        }}
                                        container={() => document.body}
                                        block
                                        placement="autoVertical"
                                        size="md"
                                        cleanable={false}
                                        className="rs-picker-default rs-picker-toggle-wrapper block"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col mt-6 space-y-2">
                            <Button 
                                block 
                                size="md" 
                                appearance="primary" 
                                color="green" 
                                onClick={handleSaveAppointment} 
                                disabled={!isSaveButtonEnabled}
                            >
                                <Icon icon="save" /> Salvar
                            </Button>
                        </div>
                    </div>
                    )
                )}
            </CustomDrawer>


            {/* Confirmation Modals */}
            <WarningModal
                show={confirmSave}
                onClose={() => setConfirmSave(false)}
                title="Confirmar Agendamento"
                confirmLabel="Sim, salvar"
                color="green"
                onConfirm={confirmSaveAppointment}
            >
                <p className="mb-4">Tem certeza que deseja salvar o agendamento?</p>
                <div className="bg-gray-50 p-4 rounded-lg text-left">
                    <p className="mb-2"><b>Serviço:</b> {servicos.find(servico => servico.id === selectedService)?.titulo}</p>
                    <p className="mb-2"><b>Profissional:</b> {profissionais.find(profissional => profissional.id === selectedProfessional)?.nome}</p>
                    <p className="mb-2"><b>Cliente:</b> {clientes.find(cliente => cliente.id === selectedClient)?.nome}</p>
                    <p className="mb-2"><b>Data:</b> {moment(selectedDate).format('DD/MM/YYYY')}</p>
                    <p className="mb-0"><b>Horário:</b> {selectedTime}</p>
                </div>
            </WarningModal>

            <WarningModal
                show={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                title="Confirmar Exclusão"
                confirmLabel="Sim, excluir"
                color="red"
                onConfirm={confirmDeleteAppointment}
            >
                <p>Tem certeza que deseja excluir este agendamento?</p>
                <p className="mt-2 font-medium text-red-600">Esta ação não pode ser desfeita.</p>
            </WarningModal>

            <WarningModal
                show={confirmFinalize}
                onClose={() => setConfirmFinalize(false)}
                title="Confirmar Finalização"
                confirmLabel="Sim, finalizar"
                color="green"
                onConfirm={confirmFinalizeAppointment}
            >
                <p>Tem certeza que deseja finalizar este agendamento?</p>
                <p className="mt-2 text-gray-600">Agendamentos finalizados não podem ser mais alterados.</p>
            </WarningModal>
        </div>
    );
};

export default Agendamentos;