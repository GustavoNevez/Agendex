import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/auth_provider";
import { Redirect } from "react-router-dom";
import ResponsiveHeader from "../Header/header_view";
import ResponsiveSidebar from "../Sidebar/sidebar_view";
import { AgendamentoProvider } from "../../context/schedule_context";

/**
 * Layout autenticado simplificado
 *
 * Este componente:
 * 1. Verifica se o usuário está autenticado
 * 2. Redireciona para login se não estiver autenticado
 * 3. Renderiza o header e sidebar responsivos
 * 4. Gerencia o estado de abertura/fechamento da sidebar desktop e mobile
 */
function AuthenticatedLayout({ children }) {
  const { signed } = useContext(AuthContext);

  // Estado para controlar a visibilidade da sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Toggle da sidebar no desktop
  const toggleDesktopSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle da sidebar no mobile
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  // Redireciona para login se não estiver autenticado
  if (!signed) {
    return <Redirect to="/login" />;
  }

  return (
    <AgendamentoProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Renderizar os componentes diretamente para melhor visibilidade e interatividade */}
        <ResponsiveHeader
          toggleDesktopSidebar={toggleDesktopSidebar}
          toggleMobileSidebar={toggleMobileSidebar}
        />
        <ResponsiveSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />

        {/* Área de conteúdo principal - ajustado para garantir consistência */}
        <div
          className={`pt-2 transition-all duration-300 ${
            sidebarOpen ? "md:ml-64" : "md:ml-16"
          }`}
        >
          {children}
        </div>
      </div>
    </AgendamentoProvider>
  );
}

export default AuthenticatedLayout;
