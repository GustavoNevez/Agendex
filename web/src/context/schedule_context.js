import React, { createContext, useState, useContext } from 'react';

// Create a context for appointment modal state management
export const AgendamentoContext = createContext({
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {}
});

// Provider component that wraps your app and makes context available to any child component
export const AgendamentoProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Open the appointment creation modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close the appointment creation modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <AgendamentoContext.Provider
      value={{
        isModalOpen,
        openModal,
        closeModal
      }}
    >
      {children}
    </AgendamentoContext.Provider>
  );
};

// Custom hook that allows components to easily access the context
export const useAgendamento = () => useContext(AgendamentoContext);