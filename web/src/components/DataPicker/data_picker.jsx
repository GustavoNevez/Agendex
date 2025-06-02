import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

// Arrays para nomes dos dias e meses em português
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "Jan",
  "Fev",
  "Mar",
  "Abril",
  "Maio",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export default function CustomDatePicker({ onChange, disabledDate, disabled }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showNoTimesMessage, setShowNoTimesMessage] = useState(false);
  const [disabledReason, setDisabledReason] = useState("");

  // Gera os dias da semana a partir da data atual
  const generateWeekDays = () => {
    const days = [];
    const firstDayOfWeek = new Date(currentDate);

    // Ajusta para iniciar na segunda-feira (1) da semana atual
    const dayOfWeek = firstDayOfWeek.getDay(); // 0 = Domingo, 1 = Segunda, ...
    const diff =
      firstDayOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    firstDayOfWeek.setDate(diff);

    // Gera os 7 dias da semana
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(firstDayOfWeek.getDate() + i);

      days.push({
        date: date,
        dayName: DIAS_SEMANA[date.getDay()],
        dayNumber: date.getDate(),
        month: MESES[date.getMonth()],
        isDisabled: disabledDate ? disabledDate(date) : false,
        isSelected: selectedDate && areSameDay(date, selectedDate),
        isToday: areSameDay(date, new Date()),
      });
    }

    return days;
  };

  // Verifica se duas datas são o mesmo dia
  const areSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Dias da semana baseados na data atual
  const weekDays = generateWeekDays();

  // Navega para a semana anterior
  const goToPreviousWeek = () => {
    if (disabled) return;
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
    setShowNoTimesMessage(false);
  };

  // Navega para a próxima semana
  const goToNextWeek = () => {
    if (disabled) return;
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
    setShowNoTimesMessage(false);
  };

  const weekMonth = () => {
    const firstDayOfWeek = new Date(currentDate);
    const dayOfWeek = firstDayOfWeek.getDay();
    const diff =
      firstDayOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    firstDayOfWeek.setDate(diff);

    return MESES[firstDayOfWeek.getMonth()];
  };

  // Seleciona uma data
  const handleDateSelect = (date, isDisabled) => {
    if (disabled || isDisabled) {
      setShowNoTimesMessage(true);
      setDisabledReason("Não há horários disponíveis neste dia");
      return;
    }

    setSelectedDate(date);
    setShowNoTimesMessage(false);

    // Always trigger the onChange callback, even if the same date is selected
    if (onChange) {
      onChange(date);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200  shadow-sm hover:shadow-md active:bg-gray-100 transition">
        {/* Botões para trocar semana no topo */}
        <div className="flex justify-between items-center p-2 bg-gray-50 border-b border-gray-200">
          <button
            onClick={goToPreviousWeek}
            className="flex items-center  text-gray-600 hover:text-violet-600 transition-colors focus:outline-none"
            aria-label="Semana anterior"
            disabled={disabled}
          >
            <ChevronLeft size={18} />
            <span className="ml-1 text-xs font-medium">Voltar</span>
          </button>
          <div className="text-center text-gray-700 font-medium  text-sm">
            {weekMonth()}
          </div>
          <button
            onClick={goToNextWeek}
            className="flex items-center  text-gray-600 hover:text-violet-600 transition-colors focus:outline-none"
            aria-label="Próxima semana"
            disabled={disabled}
          >
            <span className="mr-1 text-xs font-medium ">Avançar</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 w-full text-center py-3 bg-gray-50 border-b border-gray-200">
          {weekDays.map((day, index) => (
            <div key={index} className="text-sm font-semibold text-gray-500">
              {day.dayName}
            </div>
          ))}
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7">
          {weekDays.map((day, index) => (
            <button
              key={index}
              disabled={day.isDisabled || disabled}
              onClick={() => handleDateSelect(day.date, day.isDisabled)}
              className={`
                py-6 relative
                ${
                  day.isDisabled || disabled
                    ? "cursor-not-allowed bg-gray-100"
                    : "cursor-pointer"
                }
                ${
                  day.isSelected
                    ? "bg-violet-500"
                    : day.isDisabled || disabled
                    ? "bg-gray-100"
                    : "bg-white"
                }
                ${
                  !day.isSelected && !day.isDisabled && !disabled
                    ? "hover:bg-violet-50"
                    : ""
                }
                transition-colors duration-200 focus:outline-none
              `}
            >
              <div className="flex flex-col items-center">
                <span
                  className={`text-xl font-semibold 
                  ${
                    day.isSelected
                      ? "text-white"
                      : day.isDisabled || disabled
                      ? "text-gray-400"
                      : "text-gray-700"
                  }`}
                >
                  {day.dayNumber}
                </span>
                <span
                  className={`text-xs mt-1 
                  ${
                    day.isSelected
                      ? "text-white"
                      : day.isDisabled || disabled
                      ? "text-gray-400"
                      : "text-violet-500"
                  }`}
                >
                  {day.month}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Mensagem de horários indisponíveis */}
        {showNoTimesMessage && (
          <div className="p-3 bg-red-50 border-t border-red-100">
            <div className="flex items-center text-red-600">
              <Clock size={16} className="mr-2" />
              <p className="text-sm">{disabledReason}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
