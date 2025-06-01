import Toastify from 'toastify-js';

const defaultToastConfig = {
  duration: 5000,
  close: true,
  gravity: "bottom", // Mudado para bottom
  position: "center",
  offset: {
    y: "4rem" // Adiciona 64px de espaço na parte inferior
  },
  style: {
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "500",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
  }
};

export const showSuccessToast = (message) => {
  Toastify({
    ...defaultToastConfig,
    text: message,
    backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
  }).showToast();
};

export const showErrorToast = (message) => {
  Toastify({
    ...defaultToastConfig,
    text: message,
    backgroundColor: "linear-gradient(to right, #ff0000, #ff5f6d)",
  }).showToast();
};