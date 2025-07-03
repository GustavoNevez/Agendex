import React from "react";

const InputWithLabel = ({
  label,
  htmlFor,
  children,
  className = "",
  labelClassName = "",
  inputClassName = "",
  ...props
}) => (
  <div className={`mb-4  ${className}`}>
    {label && (
      <label
        htmlFor={htmlFor || props.id}
        className={`block font-bold mb-2 ${labelClassName}`}
      >
        {label}
      </label>
    )}
    {children ? (
      children
    ) : (
      <input
        id={htmlFor || props.id}
        className={`form-control w-full ${inputClassName}`}
        {...props}
      />
    )}
  </div>
);

export default InputWithLabel;
