import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/auth';
import { useAgendamento } from '../../context/agendamentoContext';
import logo from '../../assets/teste.png';
import whiteLogo from '../../assets/Agendex-Branco.JPG';

// Componente do botão hamburger animado - apenas para desktop
const HamburgerButton = ({ isOpen, toggle, className = "" }) => {
  return (
    <button
      onClick={toggle}
      className={`flex flex-col justify-center items-center group p-2 rounded-md focus:outline-none ${className}`}
      aria-label="Menu"
    >
      <div className="relative w-6 h-5">
        <span
          className={`absolute h-0.5 w-6 bg-gray-800 transform transition-all duration-300 ease-in-out ${
            isOpen ? 'rotate-45 translate-y-2.5' : 'translate-y-0'
          }`}
        ></span>
        <span
          className={`absolute h-0.5 w-6 bg-gray-800 transform transition-all duration-300 ease-in-out ${
            isOpen ? 'opacity-0' : 'opacity-100'
          } top-2`}
        ></span>
        <span
          className={`absolute h-0.5 w-6 bg-gray-800 transform transition-all duration-300 ease-in-out ${
            isOpen ? '-rotate-45 translate-y-2.5' : 'translate-y-4'
          }`}
        ></span>
      </div>
    </button>
  );
};

/**
 * Header responsivo simplificado
 * 
 * Versão simplificada do Header para corrigir problemas de renderização
 * Usa funções de toggle diferentes para desktop e mobile
 * Logo centralizado no header mobile
 */
function ResponsiveHeader({ toggleDesktopSidebar, toggleMobileSidebar }) {
  const { user, signed, signOut } = useContext(AuthContext);
  const { openModal } = useAgendamento();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);

  // Hook para detectar mudanças no tamanho da tela
  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Função para alternar o sidebar desktop
  const handleToggleDesktopSidebar = () => {
    setDesktopSidebarOpen(!desktopSidebarOpen);
    toggleDesktopSidebar();
  };

  // Função para lidar com o clique no botão Agendar
  const handleCreateClick = () => {
    openModal();
  };

  // Não renderiza nada se o usuário não estiver autenticado
  if (!signed) return null;

  return (
    <>
      {/* Header Mobile - renderizado apenas em telas pequenas */}
      {!isDesktop && (
        <header className="flex items-center justify-between bg-white shadow-md p-2 w-full fixed top-0 left-0 right-0 z-[150]">
          {/* Botão de menu para abrir o sidebar (à esquerda) - usa SVG original */}
          <button onClick={toggleMobileSidebar} className="text-gray-800 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Logo centralizado */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <img src={whiteLogo} className="h-7" alt="Logo" />
          </div>
          
          {/* Avatar do usuário (à direita) */}
          <div className="flex items-center">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center"
            >
              <img 
                src={"https://ui-avatars.com/api/?name=" + (user?.nome || "User") + "&background=0D8ABC&color=fff"}
                alt="User" 
                className="w-8 h-8 rounded-full"
              />
            </button>
            
            {/* Dropdown de usuário */}
            {dropdownOpen && (
              <div className="absolute right-2 top-10 w-48 bg-white rounded-md shadow-lg py-1 z-[200]">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <div className="font-semibold">{user?.nome || "Usuário"}</div>
                  <div className="text-xs">{user?.email || "email@example.com"}</div>
                </div>
                <button onClick={signOut} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  Sair
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Header Desktop - renderizado apenas em telas médias e maiores */}
      {isDesktop && (
        <header className="flex items-center justify-between bg-white shadow-md p-3 w-full fixed top-0 left-0 right-0 z-[150]">
          <div className="flex items-center">
            {/* Logo */}
            <img src={whiteLogo} className="h-8 mr-14" alt="Logo" />
            {/* Botão de menu animado para desktop - posicionado mais à esquerda com área de clique maior */}
            <div className="flex items-center justify-center">
              <HamburgerButton 
                isOpen={desktopSidebarOpen} 
                toggle={handleToggleDesktopSidebar} 
                className="hover:bg-gray-100 transition-colors mr-3 rounded-md cursor-pointer"
              />
            </div>
            {/* Barra de busca */}
            
          </div>
          
          {/* Área do usuário */}
          <div className="flex items-center">
            {/* Avatar e dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2"
              >
                <img 
                  src={"https://ui-avatars.com/api/?name=" + (user?.nome || "User") + "&background=0D8ABC&color=fff"}
                  alt="User" 
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium text-sm hidden lg:block">{user?.nome || "Usuário"}</span>
              </button>
              
              {/* Dropdown de usuário */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-semibold">{user?.nome || "Usuário"}</div>
                    <div className="text-xs">{user?.email || "email@example.com"}</div>
                  </div>
                  <button onClick={signOut} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Espaçador para empurrar o conteúdo abaixo do header fixo */}
      <div className="h-12 md:h-14"></div>
    </>
  );
}

export default ResponsiveHeader;