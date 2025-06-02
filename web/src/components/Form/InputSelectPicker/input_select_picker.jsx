import React from "react";
import { SelectPicker } from "rsuite";
import PropTypes from "prop-types";

const InputSelectPicker = ({
  value,
  onChange,
  data,
  label,
  placeholder = "Selecione uma opção",
  disabled = false,
  className = "",
  required = false,
  error = null,
  cleanable = false,
  searchable = true,
  block = true,
  size = "md",
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block font-medium mb-2">
          <b>{label}</b> {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <SelectPicker
        data={data}
        style={{
          width: "100%",
          display: "block",
        }}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        menuStyle={{
          zIndex: 1500,
          maxHeight: "300px",
        }}
        container={() => document.body}
        block={block}
        appearance="default"
        size={size}
        cleanable={cleanable}
        searchable={searchable}
        className="rs-picker-default rs-picker-toggle-wrapper block"
      />
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
};

InputSelectPicker.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
    })
  ).isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  cleanable: PropTypes.bool,
  searchable: PropTypes.bool,
  block: PropTypes.bool,
  size: PropTypes.oneOf(["lg", "md", "sm", "xs"]),
};

export default InputSelectPicker;
