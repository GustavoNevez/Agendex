import React from "react";
import { DatePicker } from "rsuite";
import PropTypes from "prop-types";

const InputDatePicker = ({
  value,
  onChange,
  label,
  placeholder = "Selecione uma data",
  disabled = false,
  className = "",
  required = false,
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block font-medium mb-2">
          <b>{label}</b> {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <DatePicker
        format="DD/MM/YYYY"
        style={{
          width: "100%",
          display: "block",
        }}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        container={() => document.body}
        menuStyle={{
          position: "fixed",
          zIndex: 1500,
        }}
        locale={{
          sunday: "Dom",
          monday: "Seg",
          tuesday: "Ter",
          wednesday: "Qua",
          thursday: "Qui",
          friday: "Sex",
          saturday: "Sáb",
          ok: "Selecionar",
          hours: "Horas",
          minutes: "Minutos",
          seconds: "Segundos",
          formattedMonthPattern: "MM/YYYY",
          formattedDayPattern: "DD/MM/YYYY",
        }}
        placement="autoVertical"
        preventOverflow
        block
        cleanable={false}
        size="md"
        className="rs-picker-default rs-picker-toggle-wrapper block"
        ranges={[]}
      />
    </div>
  );
};

InputDatePicker.propTypes = {
  value: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  required: PropTypes.bool,
};

export default InputDatePicker;
