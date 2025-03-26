import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const CalendarComponent = () => {
  const [view, setView] = useState("timeGridDay"); // Alterna entre diário e semanal

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      {/* Header do calendário */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Agenda</h2>
        <div>
          <button
            onClick={() => setView("timeGridDay")}
            className={`px-4 py-1 mx-1 rounded-md ${view === "timeGridDay" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}
          >
            Diário
          </button>
          <button
            onClick={() => setView("timeGridWeek")}
            className={`px-4 py-1 mx-1 rounded-md ${view === "timeGridWeek" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}
          >
            Semanal
          </button>
        </div>
      </div>

      {/* FullCalendar Component */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        headerToolbar={false} // Remove o cabeçalho padrão
        events={[
          { title: "Horário Indisponível", start: "2024-06-28T08:00:00", end: "2024-06-28T09:00:00", color: "#d3d3d3" },
          { title: "Cliente Teste - Musculação", start: "2024-06-28T10:00:00", end: "2024-06-28T11:00:00", color: "#007bff" }
        ]}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        editable={true}
        selectable={true}
        height="auto"
      />
    </div>
  );
};

export default CalendarComponent;
