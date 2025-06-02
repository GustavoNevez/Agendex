import React from "react";
import { Icon } from "rsuite";
import moment from "moment";

const AppointmentCard = ({ reservation, onClick }) => {
  return (
    <div
      className="bg-white p-6 rounded-2xl border border-violet-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full cursor-pointer"
      onClick={() => onClick(reservation)}
      role="button"
      tabIndex={0}
      aria-label="Detalhes do agendamento"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center border border-violet-100">
          <Icon
            icon="calendar"
            className="text-violet-600"
            style={{ fontSize: 26 }}
          />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 leading-tight">
            {reservation.servicoNome || reservation.servico || ""}
          </h3>
          <p className="text-gray-500 text-sm">
            com{" "}
            <span className="font-semibold text-violet-700">
              {reservation.profissionalNome || reservation.profissional || ""}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm mb-3">
        <div className="flex flex-col items-start">
          <span className="text-gray-400 font-medium flex items-center gap-1">
            <Icon icon="calendar-o" className="text-violet-400" /> Data
          </span>
          <span className="font-semibold text-violet-700">
            {moment(reservation.data).format("DD/MM/YYYY")}
          </span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-gray-400 font-medium flex items-center gap-1">
            <Icon icon="clock-o" className="text-violet-400" /> Horário
          </span>
          <span className="font-semibold text-violet-700">
            {reservation.horario || moment(reservation.data).format("HH:mm")}
          </span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-gray-400 font-medium flex items-center gap-1">
            <Icon icon="money" className="text-orange-400" /> Valor
          </span>
          <span className="font-semibold text-orange-600">
            R${" "}
            {typeof reservation.valor === "number"
              ? reservation.valor.toFixed(2)
              : typeof reservation.servicoPreco === "number"
              ? reservation.servicoPreco.toFixed(2)
              : "0,00"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <span
          className={`
                    px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1
                    ${
                      reservation.status === "confirmado"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : reservation.status === "pendente"
                        ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                    }
                `}
        >
          <Icon
            icon={
              reservation.status === "confirmado"
                ? "check-circle"
                : reservation.status === "pendente"
                ? "hourglass-2"
                : "info-circle"
            }
            className={
              reservation.status === "confirmado"
                ? "text-green-500"
                : reservation.status === "pendente"
                ? "text-yellow-500"
                : "text-gray-400"
            }
          />
          {reservation.status
            ? reservation.status.charAt(0).toUpperCase() +
              reservation.status.slice(1)
            : "Confirmado"}
        </span>
      </div>
    </div>
  );
};

export default AppointmentCard;
