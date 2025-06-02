// colors.js - Paleta de cores centralizada do site
export const colors = {
  // Cores principais
  primary: {
    main: "#4F46E5", // Azul principal (botões, links)
    light: "#6366F1", // Azul claro
    dark: "#3730A3", // Azul escuro
  },

  // Cores de fundo
  background: {
    primary: "#FFFFFF", // Fundo branco principal
    secondary: "#F3F4F6", // Fundo cinza muito claro
    dark: "#334155", // Fundo escuro da sidebar
    darker: "#1E293B", // Fundo mais escuro
  },

  // Cores de status
  status: {
    success: "#10B981", // Verde (Ativo)
    warning: "#F59E0B", // Amarelo
    error: "#EF4444", // Vermelho
    info: "#3B82F6", // Azul informativo
  },

  // Cores de texto
  text: {
    primary: "#1F2937", // Texto principal escuro
    secondary: "#6B7280", // Texto secundário
    light: "#9CA3AF", // Texto claro
    white: "#FFFFFF", // Texto branco
  },

  // Cores de borda
  border: {
    light: "#E5E7EB", // Borda clara
    medium: "#D1D5DB", // Borda média
    dark: "#9CA3AF", // Borda escura
  },

  // Cores específicas do layout
  sidebar: {
    background: "#334155", // Fundo da sidebar
    text: "#FFFFFF", // Texto da sidebar
    textSecondary: "#CBD5E1", // Texto secundário da sidebar
    active: "#4F46E5", // Item ativo da sidebar
    hover: "#475569", // Hover na sidebar
  },

  // Cores dos cards e componentes
  card: {
    background: "#FFFFFF", // Fundo dos cards
    border: "#E5E7EB", // Borda dos cards
    shadow: "rgba(0, 0, 0, 0.1)", // Sombra dos cards
  },

  // Cores dos botões
  button: {
    primary: "#4F46E5", // Botão primário
    primaryHover: "#4338CA", // Hover do botão primário
    secondary: "#F3F4F6", // Botão secundário
    secondaryHover: "#E5E7EB", // Hover do botão secundário
  },
};

// Versão alternativa usando CSS Custom Properties
export const cssVariables = `
:root {
  /* Cores principais */
  --color-primary: #4F46E5;
  --color-primary-light: #6366F1;
  --color-primary-dark: #3730A3;
  
  /* Cores de fundo */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F8FAFC;
  --color-bg-dark: #334155;
  --color-bg-darker: #1E293B;
  
  /* Cores de status */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* Cores de texto */
  --color-text-primary: #1F2937;
  --color-text-secondary: #6B7280;
  --color-text-light: #9CA3AF;
  --color-text-white: #FFFFFF;
  
  /* Cores de borda */
  --color-border-light: #E5E7EB;
  --color-border-medium: #D1D5DB;
  --color-border-dark: #9CA3AF;
  
  /* Sidebar */
  --color-sidebar-bg: #334155;
  --color-sidebar-text: #FFFFFF;
  --color-sidebar-text-secondary: #CBD5E1;
  --color-sidebar-active: #4F46E5;
  --color-sidebar-hover: #475569;
  
  /* Cards */
  --color-card-bg: #FFFFFF;
  --color-card-border: #E5E7EB;
  --color-card-shadow: rgba(0, 0, 0, 0.1);
  
  /* Botões */
  --color-btn-primary: #4F46E5;
  --color-btn-primary-hover: #4338CA;
  --color-btn-secondary: #F3F4F6;
  --color-btn-secondary-hover: #E5E7EB;
}
`;

// Exemplo de uso no React
export const useColors = () => colors;

// Função helper para aplicar transparência
export const withOpacity = (color, opacity) => {
  // Remove o # se presente
  const hex = color.replace("#", "");

  // Converte para RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default colors;
