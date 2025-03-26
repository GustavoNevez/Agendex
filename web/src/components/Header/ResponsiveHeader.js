import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/auth';
import { useAgendamento } from '../../context/agendamentoContext';
import logo from '../../assets/teste.png';
import whiteLogo from '../../assets/Agendex-Branco.JPG';

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

  // Hook para detectar mudanças no tamanho da tela
  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          {/* Botão de menu para abrir o sidebar (à esquerda) */}
          <button onClick={toggleMobileSidebar} className="text-gray-800 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Logo centralizado */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <img src={whiteLogo} className="h-9" alt="Logo" />
          </div>
          
          {/* Botão Agendar e Avatar do usuário (à direita) */}
          <div className="flex items-center">
            <button
              onClick={handleCreateClick}
              className="mr-2 text-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
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
        </header>
      )}

      {/* Header Desktop - renderizado apenas em telas médias e maiores */}
      {isDesktop && (
        <header className="flex items-center justify-between bg-white shadow-md p-3 w-full fixed top-0 left-0 right-0 z-[150]">
          <div className="flex items-center">
            {/* Logo */}
            <img src={whiteLogo} className="h-8 mr-10" alt="Logo" />
            <button onClick={toggleDesktopSidebar} className="text-gray-800 p-1 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Barra de busca */}
            <div className="relative mx-4">
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none w-64"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Área do usuário */}
          <div className="flex items-center space-x-4">
            {/* Botão agendar - Mostrado em todas as páginas */}
            <button 
              onClick={handleCreateClick}
              className="flex items-center text-white bg-blue-500 hover:bg-blue-600 rounded-full px-4 py-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Agendar</span>
            </button>
            
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