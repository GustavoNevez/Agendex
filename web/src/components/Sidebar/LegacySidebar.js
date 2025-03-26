import { MoreVertical, ChevronLast, ChevronFirst, Menu } from "lucide-react";
import { useContext, createContext, useState } from "react";
import { Link, withRouter } from "react-router-dom";
import { AuthContext } from "../../context/auth";
import logo from "../../assets/teste.png";

const SidebarContext = createContext();

// Separate Desktop Header Component
function DesktopHeader({ user, signOut }) {
  return (
    <header className="hidden md:flex items-center justify-between bg-gradient-to-r from-[#2F3134] to-[#3a3c40] text-white shadow-lg p-4 w-full fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center">
        <img src={logo} className="overflow-hidden transition-all w-32 mr-6" alt="Logo" />
        <div className="flex space-x-6 ml-4">
          <Link to="/agendamentos" className="hover:text-gray-300 font-medium transition-colors duration-200 flex items-center">
            <span className="mdi mdi-calendar-check mr-2"></span>
            Agendamentos
          </Link>
          <Link to="/cliente" className="hover:text-gray-300 font-medium transition-colors duration-200 flex items-center">
            <span className="mdi mdi-account-multiple mr-2"></span>
            Clientes
          </Link>
          <Link to="/servico" className="hover:text-gray-300 font-medium transition-colors duration-200 flex items-center">
            <span className="mdi mdi-auto-fix mr-2"></span>
            Serviços
          </Link>
          <Link to="/relatorio" className="hover:text-gray-300 font-medium transition-colors duration-200 flex items-center">
            <span className="mdi mdi-finance mr-2"></span>
            Relatórios
          </Link>
        </div>
      </div>
      <div className="flex items-center">
        <div className="mr-4 text-right">
          <div className="font-semibold">{user?.nome || "Usuário"}</div>
          <div className="text-xs text-gray-300">{user?.email || "email@example.com"}</div>
        </div>
        <UserAvatar />
        <button onClick={signOut} className="ml-4 text-gray-300 hover:text-red-500 transition-colors duration-200">
          <MoreVertical size={20} />
        </button>
      </div>
    </header>
  );
}

/**
 * COMPONENTE LEGADO - Mantido para referência
 * Use ResponsiveSidebar em novos desenvolvimentos
 */
function LegacySidebar({ location, hideOnRoutes }) {
  const { user, signed, signOut } = useContext(AuthContext);
  const [expanded, setExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Don't render anything if user is not signed in
  if (!signed) return null;

  return (
    <>
      {/* Always render the desktop header */}
      <DesktopHeader user={user} signOut={signOut} />
      
      {/* Spacer for desktop to push content below the fixed header */}
      <div className="hidden md:block h-16"></div>

      {/* Only show mobile header and sidebar if the route is in hideOnRoutes */}
      {hideOnRoutes.includes(location.pathname) && (
        <>
          {/* HEADER NO MOBILE */}
          <header className="flex md:hidden items-center justify-between bg-[#2F3134] text-white shadow p-2.5 w-full">
            <button onClick={() => setIsMobileOpen(true)} className="text-white ml-3">
              <Menu size={24} />
            </button>
            <img src={logo} className="overflow-hidden transition-all w-28" alt="Logo" />
            <UserAvatar />
          </header>

          {/* SIDEBAR */}
          <aside
            className={`
              h-screen fixed top-0 left-0 bg-[#2F3134] text-white border-gray-600 shadow-sm z-40
              md:relative md:translate-x-1 md:mt-0
              ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
              transition-transform md:block
            `}
          >
            <nav className="h-full flex flex-col">
              <SidebarHeader expanded={expanded} setExpanded={setExpanded} setIsMobileOpen={setIsMobileOpen} />
              <SidebarContext.Provider value={{ expanded }}>
                <SidebarMenu location={location} />
              </SidebarContext.Provider>
              <SidebarFooter user={user} signOut={signOut} expanded={expanded} />
            </nav>
          </aside>

          {/* BACKDROP NO MOBILE */}
          {isMobileOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsMobileOpen(false)} />}
        </>
      )}
    </>
  );
}

function SidebarHeader({ expanded, setExpanded, setIsMobileOpen }) {
  return (
    <div className="p-4 ml-2.5 pb-2 flex justify-between items-center">
      <img src={logo} className={`overflow-hidden transition-all ${expanded ? "w-48" : "w-0"}`} alt="Logo" />
      <div className="flex items-center gap-2">
        <button onClick={() => setExpanded(curr => !curr)} className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 hidden md:block">
          {expanded ? <ChevronFirst /> : <ChevronLast />}
        </button>
        <button onClick={() => setIsMobileOpen(false)} className="md:hidden p-1.5 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-black">✕</button>
      </div>
    </div>
  );
}

function SidebarMenu({ location }) {
  const menuItems = [
    { icon: "mdi mdi-calendar-check", text: "Agendamentos", link: "/agendamentos" },
    { icon: "mdi mdi-account-multiple", text: "Clientes", link: "/cliente" },
    { icon: "mdi mdi-auto-fix", text: "Serviços", link: "/servico" },
    { icon: "mdi mdi-finance", text: "Relatórios", link: "/relatorio" }
  ];

  return (
    <ul className="flex-1 px-2 items-center">
      {menuItems.map(({ icon, text, link }) => (
        <SidebarItem key={link} icon={<span className={icon} />} text={text} active={location.pathname === link} link={link} />
      ))}
    </ul>
  );
}

function SidebarItem({ icon, text, active, link }) {
  const { expanded } = useContext(SidebarContext);
  return (
    <li
      className={`relative flex items-center py-2 px-3 my-1 ml-2.5 font-medium rounded-md cursor-pointer transition-all group 
        ${active ? "bg-gradient-to-tr from-gray-700 to-gray-600" : "hover:bg-gray-700 hover:text-gray-200"}`}
    >
      <Link 
        to={link} 
        className="flex items-center w-full no-underline text-inherit 
                  hover:no-underline focus:no-underline active:no-underline visited:no-underline 
                  hover:text-inherit focus:text-inherit active:text-inherit visited:text-inherit"
      >
        {icon}
        <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>{text}</span>
      </Link>
    </li>
  );
}

function SidebarFooter({ user, signOut, expanded }) {
  return (
    <div className="border-t border-gray-600 flex p-3">
      <UserAvatar />
      <div className={`flex justify-between items-center text-white overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
        <div className="leading-4">
          <h4 className="font-semibold">{user?.nome || "Usuário"}</h4>
          <span className="text-xs text-gray-300">{user?.email || "email@example.com"}</span>
        </div>
        <button onClick={signOut} className="text-gray-300 hover:text-red-500">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
}

function UserAvatar() {
  return <img src="https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true" alt="User Avatar" className="w-10 h-10 rounded-md mr-3" />;
}

export default withRouter(LegacySidebar);