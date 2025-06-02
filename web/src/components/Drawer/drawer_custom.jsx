import React, { useEffect, useState } from "react";
import { Button, Icon } from "rsuite";
import PropTypes from "prop-types";
import colors from "../../styles/colors";

/**
 * Input masking functions for phone and CPF
 */
export const masks = {
  /**
   * Apply phone mask: (xx) xxxxx-xxxx or (xx) xxxx-xxxx
   * @param {string} value - The phone number to format
   * @returns {string} - Formatted phone number
   */
  phone: (value) => {
    if (!value) return "";

    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    if (digits.length <= 10) {
      // Format as (xx) xxxx-xxxx for landlines or shorter numbers
      return digits
        .replace(/(\d{2})/, "($1) ")
        .replace(/(\d{2})(\s)(\d{4})/, "$1$2$3-")
        .substring(0, 14);
    } else {
      // Format as (xx) xxxxx-xxxx for cell phones
      return digits
        .replace(/(\d{2})/, "($1) ")
        .replace(/(\d{2})(\s)(\d{5})/, "$1$2$3-")
        .substring(0, 15);
    }
  },

  /**
   * Apply CPF mask: xxx.xxx.xxx-xx
   * @param {string} value - The CPF to format
   * @returns {string} - Formatted CPF
   */
  cpf: (value) => {
    if (!value) return "";

    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    return digits
      .replace(/(\d{3})/, "$1.")
      .replace(/(\d{3})\.(\d{3})/, "$1.$2.")
      .replace(/(\d{3})\.(\d{3})\.(\d{3})/, "$1.$2.$3-")
      .substring(0, 14);
  },
};

/**
 * CustomDrawer component for standardized drawer-like modals across the application.
 * Supports responsive design and includes built-in masking for phone and CPF input fields.
 */
const CustomDrawer = ({
  show,
  onClose,
  title,
  children,
  primaryActionLabel,
  primaryActionIcon,
  primaryActionColor = "primary",
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionColor = "red",
  loading = false,
  primaryActionDisabled = false,
  showFooter = true,
  size = "md",
}) => {
  // State to track window width for responsive design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;

  // Track window resizing for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    // Clean up event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Control body scrolling when drawer is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;

    if (show) {
      // Disable scrolling on the body when drawer is open
      document.body.style.overflow = "hidden";
    } else {
      // Add a small delay before re-enabling scrolling to handle transitions
      const scrollTimer = setTimeout(() => {
        if (!show) {
          document.body.style.overflow = "auto";
        }
      }, 300);

      return () => clearTimeout(scrollTimer);
    }

    // Restore original style when component unmounts
    return () => {
      setTimeout(() => {
        document.body.style.overflow = originalStyle;
      }, 100);
    };
  }, [show]);

  // Handle width based on size prop and screen size
  const getWidth = () => {
    if (isMobile) return "100%";

    switch (size) {
      case "xs":
        return "350px";
      case "sm":
        return "450px";
      case "md":
        return "550px";
      case "lg":
        return "700px";
      case "xl":
        return "900px";
      case "full":
        return "95%";
      default:
        return "550px";
    }
  };

  if (!show) return null;

  return (
    <div
      className={show ? "custom-drawer-overlay" : ""}
      style={{
        display: show ? "flex" : "none",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1050,
        justifyContent: "center",
        alignItems: "center",
        padding: "15px",
      }}
      onClick={(e) => {
        // Close when clicking the overlay background
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          width: getWidth(),
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "15px 20px",
            borderBottom: "1px solid #e5e5e5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: colors.background.secondary,
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: isMobile ? "1.1rem" : "1.25rem",
              fontWeight: "bold",
            }}
          >
            {title}
          </h4>
          <Button appearance="subtle" onClick={onClose}>
            <Icon icon="close" />
          </Button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            maxHeight: "calc(90vh - 130px)",
            backgroundColor: colors.background.primary,
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div
            style={{
              padding: "15px 24px", // Ajustei para manter consistência
              borderTop: "1px solid #e5e5e5",
              display: "flex",
              flexDirection: isMobile ? "column-reverse" : "row",
              justifyContent: "flex-end",
              gap: isMobile ? "10px" : "10px",
              backgroundColor: colors.background.secondary,
            }}
          >
            {secondaryActionLabel && (
              <Button
                appearance="subtle"
                color={secondaryActionColor}
                onClick={onSecondaryAction || onClose}
                disabled={loading}
                style={{
                  width: isMobile ? "100%" : undefined,
                  padding: isMobile ? "8px 12px" : undefined,
                  height: isMobile ? "auto" : undefined,
                  border: "1px solid #e2e8f0", // Adicionei borda cinza clara
                  borderRadius: "6px", // Arredondamento consistente
                }}
              >
                {secondaryActionLabel}
              </Button>
            )}

            {primaryActionLabel && (
              <Button
                appearance="primary"
                color={primaryActionColor}
                onClick={onPrimaryAction}
                disabled={primaryActionDisabled || loading}
                style={{
                  width: isMobile ? "100%" : undefined,
                  padding: isMobile ? "8px 12px" : undefined,
                  height: isMobile ? "auto" : undefined,
                }}
              >
                {loading && <Icon icon="spinner" spin />}
                {primaryActionIcon && !loading && (
                  <Icon icon={primaryActionIcon} />
                )}{" "}
                {primaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * A masked input component for phone and CPF with pattern enforcement
 */
export const MaskedInput = ({
  type = "text",
  placeholder,
  value,
  onChange,
  mask,
  className,
  required = false,
  ...props
}) => {
  const handleChange = (e) => {
    const { value } = e.target;
    let maskedValue = value;

    // Apply mask if provided
    if (mask && masks[mask]) {
      maskedValue = masks[mask](value);
    }

    // Create a synthetic event object similar to the original
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: maskedValue,
      },
    };

    if (onChange) {
      onChange(syntheticEvent);
    }
  };

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value || ""}
      onChange={handleChange}
      className={`form-control ${className || ""}`}
      required={required}
      {...props}
    />
  );
};

MaskedInput.propTypes = {
  /** Input type (text, number, etc.) */
  type: PropTypes.string,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Input value */
  value: PropTypes.string,
  /** Function called when input changes */
  onChange: PropTypes.func.isRequired,
  /** Mask type to apply ('phone' or 'cpf') */
  mask: PropTypes.oneOf(["phone", "cpf"]),
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Whether the field is required */
  required: PropTypes.bool,
};

CustomDrawer.propTypes = {
  /** Whether the drawer is visible */
  show: PropTypes.bool.isRequired,
  /** Function called when the drawer is closed */
  onClose: PropTypes.func.isRequired,
  /** Drawer title */
  title: PropTypes.string.isRequired,
  /** Drawer content */
  children: PropTypes.node.isRequired,
  /** Label for the primary action button */
  primaryActionLabel: PropTypes.string,
  /** Icon for the primary action button */
  primaryActionIcon: PropTypes.string,
  /** Color for the primary action button */
  primaryActionColor: PropTypes.string,
  /** Function called when the primary action button is clicked */
  onPrimaryAction: PropTypes.func,
  /** Label for the secondary action button */
  secondaryActionLabel: PropTypes.string,
  /** Function called when the secondary action button is clicked */
  onSecondaryAction: PropTypes.func,
  /** Color for the secondary action button */
  secondaryActionColor: PropTypes.string,
  /** Whether the primary action button is in loading state */
  loading: PropTypes.bool,
  /** Whether the primary action button is disabled */
  primaryActionDisabled: PropTypes.bool,
  /** Whether to show the footer with action buttons */
  showFooter: PropTypes.bool,
  /** Drawer size: 'xs', 'sm', 'md', 'lg', 'xl', 'full' */
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl", "full"]),
};

export default CustomDrawer;
