import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../context/auth_provider";
import { Link } from "react-router-dom";
import whiteLogo from "../../assets/Agendex-Branco.JPG";

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
            isOpen ? "rotate-45 translate-y-2.5" : "translate-y-0"
          }`}
        ></span>
        <span
          className={`absolute h-0.5 w-6 bg-gray-800 transform transition-all duration-300 ease-in-out ${
            isOpen ? "opacity-0" : "opacity-100"
          } top-2`}
        ></span>
        <span
          className={`absolute h-0.5 w-6 bg-gray-800 transform transition-all duration-300 ease-in-out ${
            isOpen ? "-rotate-45 translate-y-2.5" : "translate-y-4"
          }`}
        ></span>
      </div>
    </button>
  );
};

// Ícone de chevron para o dropdown
const ChevronDownIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

// Ícone de usuário para o dropdown
const UserIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

// Ícone de logout
const LogoutIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

/**
 * Header responsivo simplificado
 *
 * Versão simplificada do Header para corrigir problemas de renderização
 * Usa funções de toggle diferentes para desktop e mobile
 * Logo centralizado no header mobile
 */
function ResponsiveHeader({ toggleDesktopSidebar, toggleMobileSidebar }) {
  const { user, signed, signOut } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Hook para detectar mudanças no tamanho da tela
  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hook para fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  // Função para alternar o sidebar desktop
  const handleToggleDesktopSidebar = () => {
    setDesktopSidebarOpen(!desktopSidebarOpen);
    toggleDesktopSidebar();
  };

  // Função para lidar com logout
  const handleSignOut = () => {
    setDropdownOpen(false);
    signOut();
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo centralizado */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link to="/">
              <img src={whiteLogo} className="h-7" alt="Logo" />
            </Link>
          </div>

          {/* Avatar do usuário (à direita) */}
          <div className="flex items-center">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center"
            >
              <img
                src={
                  "https://ui-avatars.com/api/?name=" +
                  (user?.nome || "User") +
                  "&background=0D8ABC&color=fff"
                }
                alt="User"
                className="w-8 h-8 rounded-full"
              />
            </button>

            {/* Dropdown de usuário */}
            {dropdownOpen && (
              <div className="absolute right-2 top-10 w-48 bg-white rounded-md shadow-lg py-1 z-[200]">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <div className="font-semibold">{user?.nome || "Usuário"}</div>
                  <div className="text-xs">
                    {user?.email || "email@example.com"}
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Header Desktop - renderizado apenas em telas médias e maiores */}
      {isDesktop && (
        <header className="flex items-center justify-between bg-white shadow-lg border-b border-gray-200 px-6 py-2 w-full fixed top-0 left-0 right-0 z-[150]">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src={whiteLogo} className="h-8 mr-8" alt="Logo" />
            </Link>

            {/* Botão de menu animado para desktop */}
            <div className="flex items-center justify-center">
              <HamburgerButton
                isOpen={desktopSidebarOpen}
                toggle={handleToggleDesktopSidebar}
                className="hover:bg-gray-50 transition-colors duration-200 rounded-lg p-2 cursor-pointer"
              />
            </div>
          </div>

          {/* Área do usuário */}
          <div className="flex items-center">
            {/* Avatar e dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
              >
                <img
                  src={
                    "https://ui-avatars.com/api/?name=" +
                    (user?.nome || "User") +
                    "&background=0D8ABC&color=fff"
                  }
                  alt="User"
                  className="w-8 h-8 rounded-full ring-2 ring-gray-200 group-hover:ring-gray-300 transition-all duration-200"
                />
                <div className="hidden lg:flex lg:flex-col lg:items-start">
                  <span className="font-medium text-gray-900 text-sm">
                    {user?.nome || "Usuário"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user?.email || "email@example.com"}
                  </span>
                </div>
                <ChevronDownIcon
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown de usuário */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[200] animate-in fade-in slide-in-from-top-1 duration-200">
                  {/* Informações do usuário */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          "https://ui-avatars.com/api/?name=" +
                          (user?.nome || "User") +
                          "&background=0D8ABC&color=fff"
                        }
                        alt="User"
                        className="w-9 h-9 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">
                          {user?.nome || "Usuário"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user?.email || "email@example.com"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Opções do menu */}
                  <div className="py-1">
                    <button
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                      Meu Perfil
                    </button>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <LogoutIcon className="w-4 h-4 mr-3 text-red-500" />
                      Sair da conta
                    </button>
                  </div>
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
