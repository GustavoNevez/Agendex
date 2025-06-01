import React, { useEffect, useState } from 'react';
import { Modal as RsuiteModal, Button, Icon } from 'rsuite';
import PropTypes from 'prop-types';

/**
 * Reusable Modal component that can be used throughout the project.
 * Provides consistent styling, responsive behavior, and flexible content with
 * enhanced visual design and responsiveness.
 */
const Modal = ({
  show,
  onClose,
  title,
  children,
  size = 'sm',
  primaryActionLabel,
  primaryActionIcon,
  primaryActionColor = 'primary',
  onPrimaryAction,
  secondaryActionLabel = 'Cancelar',
  onSecondaryAction,
  loading = false,
  primaryActionDisabled = false,
  showFooter = true,
  backdrop = 'static'
}) => {
  // State to track window width for responsive design
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile devices on component mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Handle secondary action defaulting to onClose if not provided
  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    } else {
      onClose();
    }
  };

  // Determine effective size based on screen size
  const effectiveSize = isMobile ? 'xs' : size;

  // Custom styles for the modal
  const modalStyle = {
    maxWidth: isMobile ? '100%' : (size === 'xs' ? '300px' : '95%'),
    width: isMobile ? '100%' : undefined,
    margin: '0 auto',
    borderRadius: '0.5rem',
    border: 'none',
    
  };

  // Create keyframes for modal animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes btnHover {
        to { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Custom button styles with hover effects
  const primaryButtonStyle = {
    width: isMobile ? '92%' : undefined,
    fontSize: isMobile ? '0.95rem' : '1rem',
    padding: '8px 16px',
    height: 'auto',
    borderRadius: '0.5rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
  };

  const secondaryButtonStyle = {
    width: isMobile ? '100%' : undefined,
    fontSize: isMobile ? '0.95rem' : '1rem',
    padding: '8px 16px',
    height: 'auto',
    borderRadius: '0.5rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
  };

  return (
    <RsuiteModal
      show={show}
      onHide={onClose}
      size={effectiveSize}
      backdrop={backdrop}
      style={modalStyle}
      className="enhanced-modal"
    >
      <RsuiteModal.Header
        style={{
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e9ecef',
          padding: isMobile ? '8px 12px' : '10px 14px',
        }}
      >
        <RsuiteModal.Title style={{ 
          fontSize: isMobile ? '0.9rem' : '0.95rem', 
          fontWeight: 600,
          color: '#2d3748',
        }}>
          {title}
        </RsuiteModal.Title>
      </RsuiteModal.Header>

      <RsuiteModal.Body 
        style={{ 
          padding: isMobile ? '8px 12px' : '10px 14px',
          fontSize: isMobile ? '0.85rem' : '0.9rem',
          color: '#4a5568',
          maxHeight: '60vh',
          overflowY: 'auto'
        }}
      >
        <div>{children}</div>
      </RsuiteModal.Body>

      {showFooter && (
        <RsuiteModal.Footer
          style={{
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #e9ecef',
            borderBottomLeftRadius: '0.5rem',
            borderBottomRightRadius: '0.5rem',
            padding: isMobile ? '8px 12px' : '10px 14px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: isMobile ? 'center' : 'flex-end',
            gap: isMobile ? '8px' : '10px',
          }}
        >
          <Button
            appearance="subtle"
            onClick={handleSecondaryAction}
            disabled={loading}
            style={secondaryButtonStyle}
            className="enhanced-secondary-btn"
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#e2e8f0';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            {secondaryActionLabel}
          </Button>
          {primaryActionLabel && (
            <Button
              appearance="primary"
              color={primaryActionColor}
              onClick={onPrimaryAction}
              disabled={primaryActionDisabled || loading}
              style={primaryButtonStyle}
              className="enhanced-primary-btn"
              onMouseOver={(e) => {
                if (!primaryActionDisabled && !loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.12)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08)';
              }}
            >
              {loading && <Icon icon="spinner" spin style={{ marginRight: '6px' }} />}
              {primaryActionIcon && !loading && <Icon icon={primaryActionIcon} style={{ marginRight: '6px' }} />}
              {primaryActionLabel}
            </Button>
          )}
        </RsuiteModal.Footer>
      )}
    </RsuiteModal>
  );
};

// Create a special warning modal component that displays a warning icon
export const WarningModal = ({ 
  show, 
  onClose, 
  title, 
  children, 
  confirmLabel = "Sim, confirmar", 
  cancelLabel = "Cancelar", 
  onConfirm,
  color = "orange"
}) => {
  return (
    <Modal
      show={show}
      onClose={onClose}
      title={title}
      primaryActionLabel={confirmLabel}
      primaryActionColor={color}
      primaryActionIcon="check"
      onPrimaryAction={onConfirm}
      secondaryActionLabel={cancelLabel}
      size="xs"
    >
      <div className="text-center">
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 8px auto',
          }}
        >
          <Icon
            icon="exclamation-triangle"
            style={{
              fontSize: '14px',
              color: '#F59E0B',
            }}
          />
        </div>
        <div style={{ 
          marginTop: '4px',
          fontSize: '0.85rem',
          lineHeight: '1.4'
        }}>
          {children}
        </div>
      </div>
    </Modal>
  );
};

WarningModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  color: PropTypes.string,
};
Modal.propTypes = {
  /** Whether the modal is visible */
  show: PropTypes.bool.isRequired,
  /** Function called when the modal is closed */
  onClose: PropTypes.func.isRequired,
  /** Modal title */
  title: PropTypes.string.isRequired,
  /** Modal content */
  children: PropTypes.node,  // Changed from .isRequired to optional
  /** Modal size: 'xs', 'sm', 'md', 'lg' */
  size: PropTypes.string,
  /** Label for the primary action button */
  primaryActionLabel: PropTypes.string,
  /** Icon for the primary action button */
  primaryActionIcon: PropTypes.string,
  /** Color for the primary action button: 'primary', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet' */
  primaryActionColor: PropTypes.string,
  /** Function called when the primary action button is clicked */
  onPrimaryAction: PropTypes.func,
  /** Label for the secondary action button */
  secondaryActionLabel: PropTypes.string,
  /** Function called when the secondary action button is clicked */
  onSecondaryAction: PropTypes.func,
  /** Whether the primary action button is in loading state */
  loading: PropTypes.bool,
  /** Whether the primary action button is disabled */
  primaryActionDisabled: PropTypes.bool,
  /** Whether to show the footer with action buttons */
  showFooter: PropTypes.bool,
  /** Backdrop behavior: 'static' or true/false */
  backdrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

export default Modal;