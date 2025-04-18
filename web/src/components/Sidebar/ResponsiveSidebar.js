import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ChevronRight, 
  Calendar, 
  Users, 
  BarChart2, 
  Briefcase, 
  Home, 
  X,
  UserCog,
  Link as LinkIcon
} from "lucide-react";
import { AuthContext } from "../../context/auth";
import logo from "../../assets/teste.png";
/**
 * Componente de barra lateral responsiva
 * 
 * Versão simplificada para corrigir problemas de renderização
 */
function ResponsiveSidebar({ isOpen, setIsOpen, mobileSidebarOpen, setMobileSidebarOpen }) {
  const { user, signOut } = useContext(AuthContext);
  const location = useLocation();
  // Estado para detectar se estamos em uma tela desktop
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  // Fechar a barra lateral móvel apenas quando a rota muda, não quando o estado muda
  useEffect(() => {
    // Só fecha a sidebar se a navegação ocorreu e a sidebar está aberta
    if (mobileSidebarOpen) {
      // Não feche automaticamente, deixe o usuário controlar
      // Isso evita que a sidebar feche imediatamente após abrir
    }
  }, [location.pathname]); // Removendo mobileSidebarOpen das dependências para evitar loop

  // Detectar mudanças no tamanho da tela
  useEffect(() => {
    function handleResize() {
      const isDesktopWidth = window.innerWidth >= 768;
      setIsDesktop(isDesktopWidth);
      
      // Ajustar o sidebar em telas pequenas
      if (window.innerWidth < 1024 && isOpen) {
        setIsOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Chamar na carga inicial
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, setIsOpen]);

  // Itens do menu principal com rotas corretas
  const menuItems = [
   
    { 
      icon: <Calendar size={20} />, 
      text: "Agendamentos", 
      link: "/agendamentos" 
    },
    { 
      icon: <Briefcase size={20} />, 
      text: "Serviços", 
      link: "/servico" 
    },
    { 
      icon: <UserCog size={20} />, 
      text: "Profissionais", 
      link: "/profissionais" 
    },
    { 
      icon: <Users size={20} />, 
      text: "Clientes", 
      link: "/cliente" 
    },
    { 
      icon: <Calendar size={20} />, 
      text: "Horários", 
      link: "/horarios" 
    },
    { 
      icon: <BarChart2 size={20} />, 
      text: "Relatorios", 
      link: "/dashboard" 
    },
    { 
      icon: <LinkIcon size={20} />, 
      text: "Links Personalizados", 
      link: "/links" 
    }
  ];

  // Função para verificar se uma rota está ativa
  const isActive = (path) => {
    if (path === '#') return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Sidebar - renderizada apenas em telas desktop */}
      {isDesktop && (
        <aside
          className={`fixed left-0 top-14 bottom-0 bg-gray-800 text-white transition-all duration-300 ease-in-out z-[140] ${
            isOpen ? "w-64" : "w-16"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Nome/Perfil no topo */}
          <div className="p-2 mb-4">
            
          </div>

          {/* Itens do menu */}
          <div className=" flex-1 overflow-y-auto">
            <nav className="px-2">
              {menuItems.map((item, index) => (
                <div key={index} className="mb-1">
                  <Link
                    to={item.link}
                    className={`flex items-center py-2 px-3 rounded-md transition-colors duration-200 no-underline text-white ${
                      isActive(item.link)
                        ? "bg-blue-600 text-white no-underline text-decoration-none border-b-0"
                        : ""
                    } hover:bg-gray-700 hover:no-underline hover:text-white`}
                    style={{ textDecoration: 'none' }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {isOpen && <span className="ml-3">{item.text}</span>}
                    {isOpen && item.submenu && <ChevronRight size={16} className="ml-auto" />}
                  </Link>
                  
                  {isOpen && item.submenu && (
                    <div className="ml-4 mt-1">
                      {item.submenu.map((subitem, subindex) => (
                        <Link
                          key={subindex}
                          to={subitem.link}
                          className={`flex items-center py-1.5 px-3 text-sm rounded-md transition-colors duration-200 no-underline hover:no-underline hover:text-gray-300 ${
                            isActive(subitem.link)
                              ? "bg-gray-700 text-white"
                              : "text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          <span>{subitem.text}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Status do WhatsApp */}
          {isOpen && (
            <div className="bg-gray-700 text-white p-2 m-2 mb-4 rounded-md">
              <div className="bg-blue-500 text-white text-center py-1 px-2 rounded-md text-sm flex items-center justify-center">
                <span className="mr-1">WhatsApp</span>
                <span>Desconectado</span>
              </div>
            </div>
          )}
        </div>
        </aside>
      )}

      {/* Mobile Sidebar - Sempre renderizado, mas com visibilidade controlada */}
      {!isDesktop && (
        <>
          <div 
            className={`md:hidden fixed inset-0 bg-black z-[150] transition-opacity duration-300 ease-in-out ${
              mobileSidebarOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setMobileSidebarOpen(false)}
          />
          
          <aside
            className="md:hidden fixed top-0 left-0 bottom-0 w-64 bg-gray-800 text-white z-[160] transition-transform duration-300 ease-in-out transform"
            style={{ transform: mobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}
          >
            <div className="flex flex-col h-full">
              {/* Cabeçalho com botão de fechar */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <img src={logo} alt="Logo" className="h-8" />
                <button 
                  onClick={() => setMobileSidebarOpen(false)}
                  className="text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Perfil do usuário */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center">
                  <img 
                    src={"https://ui-avatars.com/api/?name=" + (user?.nome || "User") + "&background=0D8ABC&color=fff"}
                    alt="User" 
                    className="w-10 h-10 rounded-full mr-3" 
                  />
                  <div>
                    <div className="font-semibold">{user?.nome || "Usuário"}</div>
                    <div className="text-xs text-gray-400">{user?.email || "email@example.com"}</div>
                  </div>
                </div>
              </div>
              
              {/* Itens do menu */}
              <div className="flex-1 overflow-y-auto">
                <nav className="px-2 py-4">
                  {menuItems.map((item, index) => (
                    <div key={index} className="mb-1">
                      <Link
                        to={item.link}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center py-2 px-3 rounded-md transition-colors duration-200 no-underline text-white ${
                          isActive(item.link)
                            ? "bg-blue-600 text-white no-underline text-decoration-none border-b-0"
                            : ""
                        } hover:bg-gray-700 hover:no-underline hover:text-white`}
                        style={{ textDecoration: 'none' }}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="ml-3">{item.text}</span>
                        {item.submenu && <ChevronRight size={16} className="ml-auto" />}
                      </Link>
                      
                      {item.submenu && (
                        <div className="ml-4 mt-1">
                          {item.submenu.map((subitem, subindex) => (
                            <Link
                              key={subindex}
                              to={subitem.link}
                              onClick={() => setMobileSidebarOpen(false)}
                              className={`flex items-center py-1.5 px-3 text-sm rounded-md transition-colors duration-200 no-underline hover:no-underline hover:text-gray-300 ${
                                isActive(subitem.link)
                                  ? "bg-gray-700 text-white"
                                  : "text-gray-300 hover:bg-gray-700"
                              }`}
                            >
                              <span>{subitem.text}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
              
              {/* Status do WhatsApp */}
              <div className="bg-gray-700 text-white p-2 m-2 mb-4 rounded-md">
                <div className="bg-blue-500 text-white text-center py-1 px-2 rounded-md text-sm flex items-center justify-center">
                  <span className="mr-1">WhatsApp</span>
                  <span>Desconectado</span>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

export default ResponsiveSidebar;