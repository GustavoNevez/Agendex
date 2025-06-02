import React from "react";
import moment from "moment";

const CustomCalendar = ({
  currentMonth,
  setCurrentMonth,
  selectedDate,
  onDateClick,
  agendamentos,
  adjustTimeFromServer,
}) => {
  const monthStart = moment(currentMonth).startOf("month");
  const monthEnd = moment(currentMonth).endOf("month");
  const startDate = moment(monthStart).startOf("week");
  const endDate = moment(monthEnd).endOf("week");

  const rows = [];
  let days = [];
  let day = startDate;

  // Render weekday headers
  const weekdayShort = moment.weekdaysShort();
  const weekdayHeader = weekdayShort.map((day) => (
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
      const formattedDate = cloneDay.format("D");
      const isCurrentMonth = cloneDay.month() === currentMonth.month();
      const isSelected = moment(selectedDate).isSame(cloneDay, "day");
      const isToday = cloneDay.isSame(moment(), "day");

      // Count appointments for this day - for the dot indicator
      const appointmentsToday = isCurrentMonth
        ? agendamentos.filter((a) => {
            const appointmentLocalDate = adjustTimeFromServer(a.data);
            return (
              appointmentLocalDate.format("YYYY-MM-DD") ===
              cloneDay.format("YYYY-MM-DD")
            );
          }).length
        : 0;

      days.push(
        <td
          key={cloneDay.format("YYYY-MM-DD")}
          className="text-center p-0 xs:p-0.5 md:p-1 relative"
        >
          <button
            className={`w-8 h-8 sm:w-7 sm:h-7 md:w-7 md:h-7 lg:w-10 lg:h-10 rounded-full mx-auto text-xs md:text-sm font-medium transition-all duration-200   ${
              isSelected
                ? "bg-indigo-600 text-white shadow-md lg:w-8 lg:h-8 focus:outline-none"
                : isToday
                ? "border-2 border-indigo-500 text-indigo-600 lg:w-8 lg:h-8 focus:outline-none"
                : isCurrentMonth
                ? "hover:bg-gray-100 text-gray-700 focus:outline-none"
                : "text-gray-300"
            }`}
            onClick={() => onDateClick(cloneDay.toDate())}
            disabled={!isCurrentMonth}
          >
            {formattedDate}
          </button>
          {/* Dot indicator for appointments */}
          {appointmentsToday > 0 && (
            <span className="absolute left-1/2 -translate-x-1/2 bottom-1 w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          )}
        </td>
      );
      day = moment(day).add(1, "day");
    }
    rows.push(<tr key={day.format("YYYY-MM-DD-row")}>{days}</tr>);
    days = [];
  }

  const prevMonth = () => {
    const newMonth = moment(currentMonth).subtract(1, "month");
    setCurrentMonth(newMonth);
  };

  const nextMonth = () => {
    const newMonth = moment(currentMonth).add(1, "month");
    setCurrentMonth(newMonth);
  };

  return (
    <div
      className="calendar-container pt-0 shadow-lg rounded-xl bg-white border border-gray-100 overflow-hidden"
      style={{ animation: "fadeIn 0.3s ease-in-out" }}
    >
      <div className="calendar-header  flex justify-between items-center bg-white p-4 border-b border-gray-100">
        <button
          onClick={prevMonth}
          className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div className="font-bold text-base text-gray-800">
          {currentMonth.format("MMMM YYYY")}
        </div>
        <button
          onClick={nextMonth}
          className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
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

export default CustomCalendar;
