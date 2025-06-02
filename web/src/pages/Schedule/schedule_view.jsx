import React, { useEffect, useState, useContext } from "react";
import "moment/locale/pt-br";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import {
  filtroAgendamento,
  fetchServicos,
  fetchClientes,
  fetchProfissionais,
  fetchDiasDisponiveisProfissional,
  saveAgendamento,
  deleteAgendamento,
  finalizeAgendamento,
  fetchProximosSeteDias,
} from "../../store/modules/schedule/schedule_action";
import { fetchTurnos } from "../../store/modules/shift/shift_actions";
import { filterTimesByBusinessHours } from "../../utils/turnos";
import { Button, Icon } from "rsuite";
import { AuthContext } from "../../context/auth_provider";
import { useAgendamento } from "../../context/schedule_context";

import { WarningModal } from "../../components/Modal/modal_custom";
import CustomDrawer from "../../components/Drawer/drawer_custom";
import InputDatePicker from "../../components/Form/InputDatePicker/input_date_picker";
import InputSelectPicker from "../../components/Form/InputSelectPicker/input_select_picker";
import AppointmentListView from "./components/appointment_list_view";

// Novo: import do calendário customizado
import CustomCalendar from "../../components/Calendar/custom_calendar";

const Agendamentos = () => {
  const dispatch = useDispatch();
  const {
    agendamentos,
    agendamentosSemana,
    servicos,
    diasDisponiveis,
    clientes,
    profissionais,
  } = useSelector((state) => state.agendamento);
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
    return moment(serverTime).add(3, "hours");
  };

  const adjustTimeToServer = (localTime) => {
    // Subtract 4 hours to convert from Brazil time (UTC-3) to server time (US Western, approx. UTC-7)
    // The difference is approximately 4 hours (could be 4 or 5 depending on daylight saving time)
    return moment(localTime).subtract(3, "hours");
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
    dispatch(
      filtroAgendamento(
        moment().startOf("month").format("YYYY-MM-DD"),
        moment().endOf("month").format("YYYY-MM-DD")
      )
    );
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
      const profissionaisDoServico = profissionais.filter(
        (profissional) =>
          profissional.servicosId &&
          profissional.servicosId.includes(selectedService)
      );
      setFilteredProfessionals(profissionaisDoServico);

      // Limpa o profissional selecionado se ele não oferece o serviço
      if (
        selectedProfessional &&
        !profissionaisDoServico.some((p) => p.id === selectedProfessional)
      ) {
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
      const profissionalSelecionado = profissionais.find(
        (p) => p.id === selectedProfessional
      );

      // Filtra apenas serviços que o profissional pode realizar
      if (profissionalSelecionado && profissionalSelecionado.servicosId) {
        const servicosDoProfissional = servicos.filter((servico) =>
          profissionalSelecionado.servicosId.includes(servico.id)
        );
        setFilteredServices(servicosDoProfissional);

        // Limpa o serviço selecionado se o profissional não o oferece
        if (
          selectedService &&
          !profissionalSelecionado.servicosId.includes(selectedService)
        ) {
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
        date: moment(selectedDate).format("YYYY-MM-DD"),
        servicoId: selectedService,
        profissionalId: selectedProfessional,
      });

      // Use fetchDiasDisponiveisProfissional when we have a professional ID
      dispatch(
        fetchDiasDisponiveisProfissional(
          user.id,
          moment(selectedDate).format("YYYY-MM-DD"),
          selectedService,
          selectedProfessional
        )
      );
    } else if (!selectedProfessional) {
      // Clear available times if no professional is selected
      setSelectedTime(null);
      setAvailableTimes([]);
    }
  }, [selectedService, selectedDate, selectedProfessional, dispatch]);

  // Process available times from agendamento/horarios-disponiveis API
  useEffect(() => {
    if (selectedDate) {
      const selectedDay = moment(selectedDate).format("YYYY-MM-DD");

      try {
        // Find available times for the selected day in the diasDisponiveis data
        const availableTimesForDay = diasDisponiveis.find(
          (dia) => dia[selectedDay]
        );

        if (availableTimesForDay) {
          const times = availableTimesForDay[selectedDay];

          // Process times to ensure we don't have duplicates
          let processedTimes = [];

          if (Array.isArray(times)) {
            // Check if times is an array of arrays or just a simple array
            if (times.length > 0 && Array.isArray(times[0])) {
              // It's an array of arrays, extract the first item from each inner array
              processedTimes = times.map((t) => t[0]);
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
          console.log(
            `Day ${selectedDay}: ${processedTimes.length} available times`
          );

          // First filter by conflicts with existing appointments
          const horariosSemConflito = filtrarHorariosDisponiveis(
            processedTimes,
            agendamentos
          );

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
        console.error("Error processing available times:", error);
        setAvailableTimes([]);
      }
    }
  }, [diasDisponiveis, selectedDate, turnos, agendamentos]);

  const filtrarHorariosDisponiveis = (
    horariosDisponiveis,
    agendamentosExistentes
  ) => {
    // Filter out times that conflict with existing appointments for the selected professional
    return horariosDisponiveis.filter((horario) => {
      const horarioMoment = moment(horario, "HH:mm");
      const horarioComData = moment(selectedDate).set({
        hour: horarioMoment.hour(),
        minute: horarioMoment.minute(),
        second: 0,
      });

      // Only check appointments for the selected professional
      const appointmentsForSelectedProfessional = selectedProfessional
        ? agendamentosExistentes.filter(
            (agendamento) =>
              agendamento.profissionalId === selectedProfessional ||
              (typeof agendamento.profissionalId === "object" &&
                agendamento.profissionalId.toString() === selectedProfessional)
          )
        : [];

      return !appointmentsForSelectedProfessional.some((agendamento) => {
        // Adjust for timezone difference when comparing
        const inicio = adjustTimeFromServer(agendamento.data);
        const final = inicio.clone().add(agendamento.duracao, "minutes");

        // Check if the time slot is between start and end of an appointment
        // Using closed interval '[]' to include the exact end time
        // This allows appointments that end exactly at closing time to be valid
        return horarioComData.isBetween(inicio, final, undefined, "[]");
      });
    });
  };

  // Debug: Log available days from diasDisponiveis whenever it changes
  useEffect(() => {
    if (diasDisponiveis && diasDisponiveis.length > 0) {
      const availableDays = diasDisponiveis.map((dayObj) => {
        const day = Object.keys(dayObj)[0];
        const times = dayObj[day];
        return { day, timeCount: times.length };
      });

      console.log("Available days with times:", availableDays);
      console.log("Total days with available times:", availableDays.length);
    }
  }, [diasDisponiveis]);

  // Ensure appointments are refreshed whenever the current month changes
  useEffect(() => {
    setIsAppointmentsLoading(true);
    const start = moment(currentMonth).startOf("month").format("YYYY-MM-DD");
    const end = moment(currentMonth).endOf("month").format("YYYY-MM-DD");
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
    if (
      selectedService &&
      selectedDate &&
      selectedTime &&
      selectedClient &&
      selectedProfessional
    ) {
      const storedUser = localStorage.getItem("@Auth:user");
      const user = JSON.parse(storedUser);

      // Create date from selected date and time
      const localDateTime = moment(
        `${moment(selectedDate).format("YYYY-MM-DD")}T${selectedTime}`
      );

      // Log for debugging timezone conversion
      console.log(
        "Local Brazil time (selected):",
        localDateTime.format("YYYY-MM-DD HH:mm")
      );

      // Adjust to server time (subtract 4 hours) before sending to the server
      const serverDateTime = adjustTimeToServer(localDateTime);
      console.log(
        "Converted to server time:",
        serverDateTime.format("YYYY-MM-DD HH:mm")
      );

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
    const start = moment(currentMonth).startOf("month").format("YYYY-MM-DD");
    const end = moment(currentMonth).endOf("month").format("YYYY-MM-DD");
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
    const selectedMonth = moment(date).format("YYYY-MM");
    const currentLoadedMonth = moment(currentMonth).format("YYYY-MM");

    if (selectedMonth !== currentLoadedMonth) {
      // Update the current month view
      setCurrentMonth(moment(date));
    }

    // Always fetch appointments when a date is clicked, regardless of month change
    // This ensures the appointment list is always refreshed
    const start = moment(date).startOf("day").format("YYYY-MM-DD");
    const end = moment(date).endOf("day").format("YYYY-MM-DD");
    dispatch(filtroAgendamento(start, end));
  };

  const prevMonth = () => {
    const newMonth = moment(currentMonth).subtract(1, "month");
    setCurrentMonth(newMonth);

    // Fetch appointments for the new month
    const start = newMonth.startOf("month").format("YYYY-MM-DD");
    const end = newMonth.endOf("month").format("YYYY-MM-DD");
    dispatch(filtroAgendamento(start, end));
  };

  const nextMonth = () => {
    const newMonth = moment(currentMonth).add(1, "month");
    setCurrentMonth(newMonth);

    // Fetch appointments for the new month
    const start = newMonth.startOf("month").format("YYYY-MM-DD");
    const end = newMonth.endOf("month").format("YYYY-MM-DD");
    dispatch(filtroAgendamento(start, end));
  };

  // Custom skeleton loading CSS classes
  const skeletonBaseStyle = "animate-pulse bg-gray-200 rounded";

  // Render skeleton loading for calendar
  const renderCalendarSkeleton = () => {
    return (
      <div
        className="calendar-container pt-0 shadow-lg rounded-xl bg-white border border-gray-100 overflow-hidden"
        style={{ animation: "fadeIn 0.3s ease-in-out" }}
      >
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
            <div
              key={`calendar-skeleton-row-${rowIndex}`}
              className="flex justify-between mb-4"
            >
              {[...Array(7)].map((_, colIndex) => (
                <div
                  key={`calendar-skeleton-cell-${rowIndex}-${colIndex}`}
                  className="w-8 mx-1"
                >
                  <div
                    className={`w-8 h-8 ${skeletonBaseStyle} rounded-full`}
                  ></div>
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
            <div
              className={`flex-1 h-9 ${skeletonBaseStyle} rounded-full mr-1`}
            ></div>
            <div
              className={`flex-1 h-9 ${skeletonBaseStyle} rounded-full ml-1`}
            ></div>
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
                        <div
                          className={`w-20 h-5 ${skeletonBaseStyle} mb-2 rounded-full`}
                        ></div>
                        <div className={`w-32 h-6 ${skeletonBaseStyle}`}></div>
                      </div>
                      <div
                        className={`w-6 h-6 ${skeletonBaseStyle} rounded-full`}
                      ></div>
                    </div>

                    <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-4 gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 ${skeletonBaseStyle} rounded-full`}
                        ></div>
                        <div className={`w-36 h-4 ${skeletonBaseStyle}`}></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 ${skeletonBaseStyle} rounded-full`}
                        ></div>
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
          <label className="block font-medium mb-1">
            <b>Serviços</b>
          </label>
          <div className={`w-full h-10 ${skeletonBaseStyle}`}></div>
        </div>
        <div className="mb-3">
          <label className="block font-medium mb-1">
            <b>Profissionais</b>
          </label>
          <div className={`w-full h-10 ${skeletonBaseStyle}`}></div>
        </div>
        <div className="mb-3">
          <label className="block font-medium mb-1">
            <b>Clientes</b>
          </label>
          <div className={`w-full h-10 ${skeletonBaseStyle}`}></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-3">
            <label className="block font-medium mb-1">
              <b>Data</b>
            </label>
            <div className={`w-full h-10 ${skeletonBaseStyle}`}></div>
          </div>
          <div className="mb-3">
            <label className="block font-medium mb-1">
              <b>Horário</b>
            </label>
            <div className={`w-full h-10 ${skeletonBaseStyle}`}></div>
          </div>
        </div>

        <div className="flex flex-col mt-4 space-y-2">
          <div className={`w-full h-10 ${skeletonBaseStyle}`}></div>
        </div>
      </div>
    );
  };

  // Novo: verifica se falta cadastro de entidades essenciais
  const missingEntities = [];
  if (!servicos || servicos.length === 0) missingEntities.push("serviços");
  if (!profissionais || profissionais.length === 0)
    missingEntities.push("profissionais");
  if (!clientes || clientes.length === 0) missingEntities.push("clientes");

  const isSaveButtonEnabled =
    selectedService &&
    selectedDate &&
    selectedTime &&
    selectedClient &&
    selectedProfessional;

  return (
    <div className="p-4">
      {/* AVISO DE ENTIDADES FALTANDO */}
      {missingEntities.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded shadow text-yellow-800 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-yellow-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12A9 9 0 11 3 12a9 9 0 0118 0z"
            />
          </svg>
          <span>
            Para cadastrar um agendamento, é necessário cadastrar:{" "}
            <b>{missingEntities.join(", ")}</b>.
          </span>
        </div>
      )}

      {/* Calendar and Day View Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
        <div className="md:col-span-1 flex flex-col">
          {isCalendarLoading ? (
            renderCalendarSkeleton()
          ) : (
            <CustomCalendar
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              agendamentos={agendamentos}
              adjustTimeFromServer={adjustTimeFromServer}
            />
          )}
          <div
            className="mt-4"
            style={{ animation: "fadeIn 0.3s ease-in-out" }}
          >
            <Button
              appearance="primary"
              color="green"
              size="lg"
              block
              onClick={handleAddAppointment}
              style={{
                background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
                boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)",
                transition: "all 0.3s ease",
                border: "none",
                transform: "translateY(0)",
              }}
              className="hover:shadow-lg hover:translate-y-[-2px]"
            >
              <Icon icon="plus" /> Novo Agendamento
            </Button>
          </div>
        </div>
        <div className="md:col-span-2">
          {isAppointmentsLoading ? (
            renderTimeSlotsSkeletons()
          ) : (
            <AppointmentListView
              view={view}
              setView={setView}
              selectedDate={selectedDate}
              agendamentos={agendamentos}
              agendamentosSemana={agendamentosSemana}
              profissionais={profissionais}
              adjustTimeFromServer={adjustTimeFromServer}
              handleSelectEvent={handleSelectEvent}
            />
          )}
        </div>
      </div>

      {/* Appointment drawer using our reusable CustomDrawer component */}
      <CustomDrawer
        show={drawerOpen}
        onClose={handleCloseDrawer}
        title={
          selectedAppointment
            ? "Informações do Agendamento"
            : "Adicionar Agendamento"
        }
        primaryActionLabel={
          selectedAppointment ? "Finalizar Agendamento" : "Salvar"
        }
        primaryActionIcon={selectedAppointment ? "check" : "save"}
        primaryActionColor={selectedAppointment ? "green" : "primary"}
        onPrimaryAction={
          selectedAppointment
            ? handleFinalizeAppointment
            : handleSaveAppointment
        }
        primaryActionDisabled={!selectedAppointment && !isSaveButtonEnabled}
        secondaryActionLabel={selectedAppointment ? "Deletar" : "Cancelar"}
        secondaryActionColor={selectedAppointment ? "red" : "default"}
        onSecondaryAction={
          selectedAppointment ? handleDeleteAppointment : handleCloseDrawer
        }
        size="md"
      >
        {selectedAppointment ? (
          isServicesLoading || isClientsLoading || isProfessionalsLoading ? (
            renderDrawerFieldsSkeleton()
          ) : (
            <div className="mt-3 space-y-3">
              <div className="mb-3">
                <label className="block font-medium mb-1">
                  <b>Cliente</b>
                </label>
                <p>
                  {selectedAppointment.cliente?.nome ||
                    (selectedAppointment.clienteId &&
                      selectedAppointment.clienteId[0]?.nome) ||
                    clientes.find((c) => c.id === selectedAppointment.clienteId)
                      ?.nome ||
                    "Cliente não identificado"}
                </p>
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">
                  <b>Serviço</b>
                </label>
                <p>
                  {selectedAppointment.servico?.titulo ||
                    (selectedAppointment.servicoId &&
                      selectedAppointment.servicoId[0]?.titulo) ||
                    servicos.find((s) => s.id === selectedAppointment.servicoId)
                      ?.titulo ||
                    "Serviço não identificado"}
                </p>
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">
                  <b>Profissional</b>
                </label>
                <p>
                  {selectedAppointment.profissional?.nome ||
                    selectedAppointment.profissionalNome ||
                    (selectedAppointment.profissionalId &&
                      profissionais.find(
                        (p) =>
                          p.id === selectedAppointment.profissionalId ||
                          (typeof selectedAppointment.profissionalId ===
                            "object" &&
                            p.id ===
                              selectedAppointment.profissionalId.toString())
                      )?.nome) ||
                    "Profissional não identificado"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-3">
                  <label className="block font-medium mb-1">
                    <b>Data</b>
                  </label>
                  <p>
                    {moment(
                      selectedAppointment.data || selectedAppointment.start
                    ).format("DD/MM/YYYY")}
                  </p>
                </div>
                <div className="mb-3">
                  <label className="block font-medium mb-1">
                    <b>Horário</b>
                  </label>
                  <p>
                    {adjustTimeFromServer(
                      selectedAppointment.data || selectedAppointment.start
                    ).format("HH:mm")}
                  </p>
                </div>
              </div>
            </div>
          )
        ) : isServicesLoading || isClientsLoading || isProfessionalsLoading ? (
          renderDrawerFieldsSkeleton()
        ) : (
          <div className="mt-3 space-y-3">
            <div className="mb-4">
              <div className="w-full">
                <InputSelectPicker
                  label="Serviços"
                  required
                  data={(selectedProfessional
                    ? filteredServices
                    : servicos
                  ).map((servico) => ({
                    label: servico.titulo,
                    value: servico.id,
                  }))}
                  value={selectedService}
                  onChange={(value) => {
                    setSelectedService(value);
                    const selected = servicos.find(
                      (servico) => servico.id === value
                    );
                    setSelectedPrice(selected ? selected.preco : null);
                  }}
                  placeholder="Todos serviços disponíveis"
                />
              </div>
            </div>
            <div className="mb-4">
              <div className="w-full">
                <InputSelectPicker
                  label="Profissionais"
                  required
                  data={(selectedService
                    ? filteredProfessionals
                    : profissionais
                  ).map((profissional) => ({
                    label: profissional.nome,
                    value: profissional.id,
                  }))}
                  value={selectedProfessional}
                  onChange={setSelectedProfessional}
                  placeholder="Selecione um profissional"
                />
              </div>
              {selectedService && filteredProfessionals.length === 0 && (
                <small className="text-red-500 mt-1 block">
                  Não há profissionais disponíveis para este serviço
                </small>
              )}
              {selectedProfessional &&
                selectedService &&
                filteredServices.length === 0 && (
                  <small className="text-red-500 mt-1 block">
                    Este profissional não realiza o serviço selecionado
                  </small>
                )}
            </div>
            <div className="mb-4">
              <div className="w-full">
                <InputSelectPicker
                  label="Clientes"
                  required
                  data={clientes.map((cliente) => ({
                    label: cliente.nome,
                    value: cliente.id,
                  }))}
                  value={selectedClient}
                  onChange={setSelectedClient}
                  placeholder="Todos clientes ativos"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <div className="w-full">
                  <InputDatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    label="Data"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <div className="w-full">
                  <InputSelectPicker
                    label="Horário"
                    required
                    data={availableTimes.map((time) => ({
                      label: time,
                      value: time,
                    }))}
                    value={selectedTime}
                    onChange={setSelectedTime}
                    placeholder="Selecione um horário"
                  />
                </div>
              </div>
            </div>
          </div>
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
          <p className="mb-2">
            <b>Serviço:</b>{" "}
            {servicos.find((servico) => servico.id === selectedService)?.titulo}
          </p>
          <p className="mb-2">
            <b>Profissional:</b>{" "}
            {
              profissionais.find(
                (profissional) => profissional.id === selectedProfessional
              )?.nome
            }
          </p>
          <p className="mb-2">
            <b>Cliente:</b>{" "}
            {clientes.find((cliente) => cliente.id === selectedClient)?.nome}
          </p>
          <p className="mb-2">
            <b>Data:</b> {moment(selectedDate).format("DD/MM/YYYY")}
          </p>
          <p className="mb-0">
            <b>Horário:</b> {selectedTime}
          </p>
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
        <p className="mt-2 font-medium text-red-600">
          Esta ação não pode ser desfeita.
        </p>
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
        <p className="mt-2 text-gray-600">
          Agendamentos finalizados não podem ser mais alterados.
        </p>
      </WarningModal>
    </div>
  );
};

export default Agendamentos;
