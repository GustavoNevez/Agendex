import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import { AuthContext } from '../../context/auth';
import logo from '../../assets/teste.png';

/**
 * COMPONENTE LEGADO - Mantido para referência
 * Use ResponsiveHeader em novos desenvolvimentos
 */
function LegacyHeader() {
  const { user, signed, signOut } = useContext(AuthContext);

  // Don't render anything if user is not signed in
  if (!signed) return null;

  return (
    <>
      {/* Desktop Header */}
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

      {/* Spacer for desktop to push content below the fixed header */}
      <div className="hidden md:block h-16"></div>
    </>
  );
}

function UserAvatar() {
  return <img src="https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true" alt="User Avatar" className="w-10 h-10 rounded-md mr-3" />;
}

export default LegacyHeader;