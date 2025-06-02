import React from "react";
import moment from "moment";

const AppointmentListView = ({
  view,
  setView,
  selectedDate,
  agendamentos,
  agendamentosSemana,
  profissionais,
  adjustTimeFromServer,
  handleSelectEvent,
}) => {
  // Daily appointments
  const today = moment(selectedDate).format("YYYY-MM-DD");
  const dayAppointments = agendamentos.filter((a) => {
    const localAppointmentDate = adjustTimeFromServer(a.data);
    return localAppointmentDate.format("YYYY-MM-DD") === today;
  });

  dayAppointments.sort((a, b) => {
    const timeA = adjustTimeFromServer(a.data);
    const timeB = adjustTimeFromServer(b.data);
    return timeA.diff(timeB);
  });

  return (
    <div className="time-slots-container bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
      <div className="sticky top-0 bg-white border-b border-gray-100 p-3">
        <div className="view-toggles flex mb-2 w-full rounded-full border border-indigo-600 overflow-hidden ">
          <button
            className={`flex-1 px-3 md:px-5 py-2 text-sm font-medium rounded-l-full transition-all duration-200 ${
              view === "Diário"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-indigo-100 text-indigo-700"
            }`}
            onClick={() => setView("Diário")}
          >
            <span className="flex items-center justify-center gap-1 md:gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
              view === "Semanal"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-indigo-100 text-indigo-700"
            }`}
            onClick={() => setView("Semanal")}
          >
            <span className="flex items-center justify-center gap-1 md:gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className="text-xs md:text-sm">Semanal</span>
            </span>
          </button>
        </div>
      </div>

      <div className="time-slots p-1">
        {view === "Diário" ? (
          dayAppointments.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <p className="mt-4 text-gray-500 font-medium">
                Nenhum agendamento para esta data
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dayAppointments.map((appointment) => {
                const service =
                  appointment.servico ||
                  (appointment.servicoId && appointment.servicoId.length > 0
                    ? appointment.servicoId[0]
                    : { titulo: "Serviço" });

                const client =
                  appointment.cliente ||
                  (appointment.clienteId && appointment.clienteId.length > 0
                    ? appointment.clienteId[0]
                    : { nome: "Cliente" });

                let professionalName = "Profissional";
                if (appointment.profissional && appointment.profissional.nome) {
                  professionalName = appointment.profissional.nome;
                } else if (appointment.profissionalNome) {
                  professionalName = appointment.profissionalNome;
                } else if (appointment.profissionalId) {
                  const foundProfessional = profissionais.find(
                    (p) =>
                      p.id === appointment.profissionalId ||
                      (typeof appointment.profissionalId === "object" &&
                        p.id === appointment.profissionalId.toString())
                  );
                  if (foundProfessional && foundProfessional.nome) {
                    professionalName = foundProfessional.nome;
                  }
                }

                const appointmentTime = adjustTimeFromServer(appointment.data);

                return (
                  <div
                    key={
                      appointment._id ||
                      `appointment-${appointmentTime.format("HH-mm")}`
                    }
                    className="bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer"
                    onClick={() => handleSelectEvent(appointment)}
                  >
                    <div className="flex items-center border-l-4 border-indigo-500">
                      <div className="bg-indigo-50 p-3 sm:p-4 flex flex-col items-center justify-center min-w-[60px] sm:min-w-[90px]">
                        <span className="text-xl font-bold text-indigo-700">
                          {appointmentTime.format("HH:mm")}
                        </span>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full mb-2">
                              Confirmado
                            </span>
                            <h3 className="font-bold text-lg text-gray-800">
                              {service.titulo}
                            </h3>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="1"></circle>
                              <circle cx="19" cy="12" r="1"></circle>
                              <circle cx="5" cy="12" r="1"></circle>
                            </svg>
                          </button>
                        </div>
                        <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-4 gap-2 mt-2">
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 flex-shrink-0 text-gray-400"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <p className="font-medium text-gray-700 text-sm sm:text-base truncate">
                              Cliente:{" "}
                              <span className="font-semibold">
                                {client.nome}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 flex-shrink-0 text-gray-400"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                              <path d="M12 3v4"></path>
                              <path d="M8 7h8"></path>
                              <circle cx="12" cy="11" r="2"></circle>
                            </svg>
                            <p className="font-medium text-gray-700 text-sm sm:text-base truncate">
                              Profissional:{" "}
                              <span className="font-semibold">
                                {professionalName}
                              </span>
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
          <div className="space-y-6">
            {agendamentosSemana.length > 0 ? (
              Object.entries(
                agendamentosSemana.reduce((days, appointment) => {
                  const dayDate = moment(appointment.data).format("YYYY-MM-DD");
                  if (!days[dayDate]) days[dayDate] = [];
                  days[dayDate].push(appointment);
                  return days;
                }, {})
              ).map(([dayDate, appointments]) => {
                const dayMoment = moment(dayDate);
                const dayStr = dayMoment.format("DD/MM");
                const dayName = dayMoment.format("dddd");
                const isToday = dayMoment.isSame(moment(), "day");

                appointments.sort((a, b) => {
                  return moment(a.data).diff(moment(b.data));
                });

                return (
                  <div
                    key={`day-${dayDate}`}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="bg-gray-50 p-3 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">
                          {dayStr} - {dayName}
                        </h3>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isToday ? "bg-blue-100 text-blue-800" : ""
                          }`}
                        >
                          {isToday ? "Hoje" : ""}
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      {appointments.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500">
                            Nenhum agendamento para esta data
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {appointments.map((appointment) => {
                            const service = appointment.servico || {
                              titulo: "Serviço",
                            };
                            const client = appointment.cliente || {
                              nome: "Cliente",
                            };
                            const professionalName = appointment.profissional
                              ? appointment.profissional.nome
                              : "Profissional";
                            const appointmentTime = adjustTimeFromServer(
                              appointment.data
                            );
                            return (
                              <div
                                key={
                                  appointment._id ||
                                  `appointment-${appointmentTime.format(
                                    "HH-mm"
                                  )}`
                                }
                                className="bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer mb-3"
                                onClick={() => handleSelectEvent(appointment)}
                              >
                                <div className="flex items-center border-l-4 border-indigo-500">
                                  <div className="bg-indigo-50 p-3 flex flex-col items-center justify-center min-w-[70px]">
                                    <span className="text-lg font-bold text-indigo-700">
                                      {appointmentTime.format("HH:mm")}
                                    </span>
                                  </div>
                                  <div className="flex-1 p-3">
                                    <div className="flex justify-between items-start mb-1">
                                      <div>
                                        <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full mb-1">
                                          Confirmado
                                        </span>
                                        <h3 className="font-bold text-gray-800">
                                          {service.titulo}
                                        </h3>
                                      </div>
                                    </div>
                                    <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-2 gap-1 mt-1">
                                      <div className="flex items-center gap-1">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4 text-gray-400"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                          <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                        <p className="font-medium text-gray-700 text-sm">
                                          Cliente:{" "}
                                          <span className="font-semibold">
                                            {client.nome}
                                          </span>
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4 text-gray-400"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                          <path d="M12 3v4"></path>
                                          <path d="M8 7h8"></path>
                                          <circle
                                            cx="12"
                                            cy="11"
                                            r="2"
                                          ></circle>
                                        </svg>
                                        <p className="font-medium text-gray-700 text-sm">
                                          Profissional:{" "}
                                          <span className="font-semibold">
                                            {professionalName}
                                          </span>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-gray-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <p className="mt-4 text-gray-500 font-medium">
                  Nenhum agendamento para os próximos 7 dias
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentListView;
