import React from 'react';

/**
 * Nova Dashboard Principal
 * 
 * Exibe widgets com:
 * - Agendamentos ativos
 * - Agendamentos em andamento
 * - Agendamentos finalizados este mês
 * - Lista de agendamentos futuros
 */
function Dashboard() {
  // Dados mockados (sem consumir APIs reais)
  const agendamentosAtivos = 12;
  const agendamentosAndamento = 3;
  const agendamentosFinalizadosMes = 28;
  
  const agendamentosFuturos = [
    { id: 1, cliente: 'Maria Silva', servico: 'Corte de Cabelo', data: '27/03/2025', horario: '14:30' },
    { id: 2, cliente: 'João Oliveira', servico: 'Barbear', data: '28/03/2025', horario: '10:00' },
    { id: 3, cliente: 'Ana Souza', servico: 'Coloração', data: '29/03/2025', horario: '15:45' },
    { id: 4, cliente: 'Carlos Ferreira', servico: 'Manicure', data: '30/03/2025', horario: '09:15' },
    { id: 5, cliente: 'Juliana Santos', servico: 'Depilação', data: '31/03/2025', horario: '16:30' },
  ];

  return (
    <div className="p-6"style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao seu painel de controle</p>
      </div>

      {/* Widgets de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Agendamentos Ativos */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agendamentos Ativos</p>
              <p className="text-3xl font-bold text-gray-800">{agendamentosAtivos}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <span className="text-sm text-green-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
                10% 
              </span>
              <span className="text-sm text-gray-500 ml-2">desde o mês passado</span>
            </div>
          </div>
        </div>

        {/* Agendamentos em Andamento */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Andamento</p>
              <p className="text-3xl font-bold text-gray-800">{agendamentosAndamento}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <span className="text-sm text-blue-500">Hoje</span>
            </div>
          </div>
        </div>

        {/* Agendamentos Finalizados este Mês */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Finalizados neste mês</p>
              <p className="text-3xl font-bold text-gray-800">{agendamentosFinalizadosMes}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <span className="text-sm text-green-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
                15%
              </span>
              <span className="text-sm text-gray-500 ml-2">comparado ao mês anterior</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendário da semana */}
      <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="font-semibold text-gray-800">Esta Semana</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 text-center">
            <div className="text-xs font-medium text-gray-500 uppercase">Dom</div>
            <div className="text-xs font-medium text-gray-500 uppercase">Seg</div>
            <div className="text-xs font-medium text-gray-500 uppercase">Ter</div>
            <div className="text-xs font-medium text-gray-500 uppercase">Qua</div>
            <div className="text-xs font-medium text-gray-500 uppercase">Qui</div>
            <div className="text-xs font-medium text-gray-500 uppercase">Sex</div>
            <div className="text-xs font-medium text-gray-500 uppercase">Sáb</div>
            
            {/* Dias do calendário (exemplo) */}
            <button className="p-3 shadow-sm border border-gray-200 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              <span className="text-gray-700 font-medium">26</span>
            </button>
            <button className="p-3 shadow-sm border border-gray-200 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              <span className="text-gray-700 font-medium">27</span>
            </button>
            <button className="p-3 shadow-sm border border-gray-200 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              <span className="text-gray-700 font-medium">28</span>
            </button>
            <button className="p-3 shadow-sm border border-gray-200 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              <span className="text-gray-700 font-medium">29</span>
            </button>
            <button className="p-3 bg-blue-50 border-blue-300 border shadow-sm rounded-md hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              <span className="text-blue-700 font-semibold">30</span>
              <div className="mt-1 w-1.5 h-1.5 mx-auto rounded-full bg-blue-500"></div>
            </button>
            <button className="p-3 shadow-sm border border-gray-200 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              <span className="text-gray-700 font-medium">31</span>
            </button>
            <button className="p-3 shadow-sm border border-gray-200 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              <span className="text-gray-700 font-medium">1</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Agendamentos Futuros */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Próximos Agendamentos</h2>
          <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
            Ver todos
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviço
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horário
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agendamentosFuturos.map(agendamento => (
                <tr key={agendamento.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
                        {agendamento.cliente.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{agendamento.cliente}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{agendamento.servico}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{agendamento.data}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{agendamento.horario}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Confirmado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;