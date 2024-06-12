import Toastify from 'toastify-js';

export const showSuccessToast = (message) => {
  Toastify({
    text: message,
    duration: 5000, // tempo em milissegundos que o toast ficará visível
    close: true, // mostra um botão de fechar
    gravity: "bottom", // `top` ou `bottom`
    position: "right", // `left`, `center` ou `right`
    backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)", // cor de fundo para sucesso
  }).showToast();
};

export const showErrorToast = (message) => {
  Toastify({
    text: message,
    duration: 5000,
    close: true,
    gravity: "bottom",
    position: "right",
    backgroundColor: "linear-gradient(to right, #ff0000, #ff5f6d)", // cor de fundo para erro
  }).showToast();
};