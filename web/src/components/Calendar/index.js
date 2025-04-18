import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./styles.css"; // We'll create this file next

const CalendarComponent = () => {
  const [view, setView] = useState("timeGridDay"); // Alterna entre diário e semanal

  return (
    <div className="calendar-container p-5 bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Header do calendário */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-3">
        <h2 className="text-xl font-bold text-gray-800">Agenda</h2>
        <div className="view-toggle-container bg-gray-100 rounded-full p-1 flex">
          <button
            onClick={() => setView("timeGridDay")}
            className={`px-5 py-2 rounded-full transition-all duration-200 flex items-center gap-2 ${
              view === "timeGridDay" 
                ? "bg-indigo-600 text-white shadow-md" 
                : "bg-transparent text-gray-600 hover:bg-gray-200"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Diário
          </button>
          <button
            onClick={() => setView("timeGridWeek")}
            className={`px-5 py-2 rounded-full transition-all duration-200 flex items-center gap-2 ${
              view === "timeGridWeek" 
                ? "bg-indigo-600 text-white shadow-md" 
                : "bg-transparent text-gray-600 hover:bg-gray-200"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <line x1="9" y1="10" x2="9" y2="22"></line>
              <line x1="15" y1="10" x2="15" y2="22"></line>
            </svg>
            Semanal
          </button>
        </div>
      </div>

      {/* FullCalendar Component with Modern Styling */}
      <div className="calendar-wrapper rounded-lg overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          events={[
            { title: "Horário Indisponível", start: "2024-06-28T08:00:00", end: "2024-06-28T09:00:00", backgroundColor: "#e5e7eb", borderColor: "#d1d5db", textColor: "#4b5563" },
            { title: "Cliente Teste - Musculação", start: "2024-06-28T10:00:00", end: "2024-06-28T11:00:00", backgroundColor: "#818cf8", borderColor: "#6366f1", textColor: "#ffffff" }
          ]}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          editable={true}
          selectable={true}
          height="auto"
          eventBorderRadius={8}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false
          }}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: '08:00',
            endTime: '18:00',
          }}
          nowIndicator={true}
          dayMaxEvents={4}
          eventDisplay="block"
          dayHeaderFormat={{
            weekday: 'long',
            day: 'numeric'
          }}
        />
      </div>

      {/* Legenda */}
      <div className="mt-5 flex flex-wrap gap-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded-full bg-indigo-500 mr-2"></span>
          <span className="text-sm text-gray-700">Agenda confirmada</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded-full bg-gray-300 mr-2"></span>
          <span className="text-sm text-gray-700">Horário indisponível</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded-full bg-green-500 mr-2"></span>
          <span className="text-sm text-gray-700">Finalizado</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
