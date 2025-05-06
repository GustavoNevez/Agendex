import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Button, Icon } from 'rsuite';
import api from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../utils/notifications';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'rsuite/dist/styles/rsuite-default.css';

moment.locale('pt-br');

const PublicScheduling = () => {
    const { customLink } = useParams(); // Extracting just the customLink
    const location = useLocation();
    
    // Determine the type from the URL path instead of route params
    const type = location.pathname.includes('/public/e/') ? 'e' : 'p';
    
    console.log("Route params:", { customLink, type, path: location.pathname });
    
    const [loading, setLoading] = useState(true);
    const [pageData, setPageData] = useState({
        estabelecimento: null,
        profissional: null,
        profissionais: [],
        servicos: [],
    });
    
    const [formState, setFormState] = useState({
        nome: '',
        email: '',
        telefone: '',
        servicoId: '',
        profissionalId: '',
        data: null,
        horario: '',
    });
    
    const [availableDates, setAvailableDates] = useState([]);
    const [availableHours, setAvailableHours] = useState([]);
    const [step, setStep] = useState(1); // 1: Seleção do serviço, 2: Seleção de data/hora, 3: Confirmação
    const [submitting, setSubmitting] = useState(false);
    const [agendamentoSuccess, setAgendamentoSuccess] = useState(false);
    const [agendamentoData, setAgendamentoData] = useState(null);
    const [currentScreen, setCurrentScreen] = useState('inicio'); // 'inicio', 'agendar', 'reservas', 'mais'
    // Add mock reservations data
    const [mockReservations] = useState([
        {
            id: 'r1',
            servicoNome: 'Corte de Cabelo',
            profissionalNome: 'João Silva',
            data: moment().add(2, 'days').toISOString(),
            status: 'confirmado',
            valor: 50.00
        },
        {
            id: 'r2',
            servicoNome: 'Barba',
            profissionalNome: 'Maria Oliveira',
            data: moment().add(5, 'days').toISOString(),
            status: 'pendente',
            valor: 30.00
        },
        {
            id: 'r3',
            servicoNome: 'Combo Cabelo e Barba',
            profissionalNome: 'João Silva',
            data: moment().subtract(2, 'days').toISOString(),
            status: 'concluído',
            valor: 70.00
        }
    ]);

    useEffect(() => {
        if (customLink && type) {
            fetchInitialData();
        }
    }, [customLink, type]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            
            // Busca dados baseados no tipo de link (estabelecimento ou profissional)
            const endpoint = type === 'e' 
                ? `/public/estabelecimento/customLink/${customLink}` 
                : `/public/profissional/customLink/${customLink}`;
            
            console.log(`Fazendo requisição para: ${endpoint}`);
            
            // Criar dados simulados (mock data)
            const mockData = {
                estabelecimento: {
                    id: "123",
                    nome: "Barbearia Exemplo",
                    endereco: "Av. Principal, 123",
                    telefone: "(11) 99999-9999"
                },
                profissional: type === 'p' ? {
                    id: "456",
                    nome: "João Silva",
                    especialidade: "Barbeiro",
                    email: "joao@exemplo.com"
                } : null,
                profissionais: [
                    {
                        id: "456",
                        nome: "João Silva",
                        especialidade: "Barbeiro"
                    },
                    {
                        id: "789",
                        nome: "Maria Oliveira",
                        especialidade: "Cabeleireira"
                    }
                ],
                servicos: [
                    {
                        id: "s1",
                        titulo: "Corte de Cabelo",
                        descricao: "Corte masculino",
                        preco: 40.00,
                        duracao: "00:30:00"
                    },
                    {
                        id: "s2",
                        titulo: "Barba",
                        descricao: "Corte e modelagem",
                        preco: 30.00,
                        duracao: "00:20:00"
                    }
                ]
            };
            
            // Tentar buscar da API com tratamento de erros mais robusto
            try {
                // Adicionar um timeout para evitar que a requisição fique presa infinitamente
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
                
                const response = await api.get(endpoint, {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId); // Limpar o timeout se a requisição completar
                
                if (response.data && !response.data.error) {
                    // Usar dados reais da API
                    const apiData = {
                        estabelecimento: response.data.estabelecimento || null,
                        profissional: response.data.profissional || null,
                        profissionais: response.data.profissionais || [],
                        servicos: response.data.servicos || [],
                    };
                    
                    console.log("Dados da API processados:", apiData);
                    setPageData(apiData);
                    
                    // Se for link de profissional, pré-seleciona o profissional
                    if (type === 'p' && response.data.profissional) {
                        setFormState(prev => ({
                            ...prev,
                            profissionalId: response.data.profissional.id
                        })); 
                    }
                } else {
                    // Fallback para mock data se a API retornar erro
                    throw new Error("API retornou erro");
                }
            } catch (apiError) {
                // Se qualquer erro ocorrer na API (timeout, 404, etc), usar dados simulados
                console.warn("⚠️ USANDO DADOS SIMULADOS - Erro na API ou endpoint não implementado");
                console.log("Usando dados simulados:", mockData);
                
                // Configura os dados simulados
                setPageData(mockData);
                
                // Se for link de profissional, pré-seleciona o profissional
                if (type === 'p' && mockData.profissional) {
                    setFormState(prev => ({
                        ...prev,
                        profissionalId: mockData.profissional.id
                    }));
                }
            }
            
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            showErrorToast("Não foi possível carregar os dados necessários");
            
            // Definir um estado de erro para mostrar uma mensagem alternativa
            setPageData({
                estabelecimento: null,
                profissional: null,
                profissionais: [],
                servicos: [],
                error: true
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableDates = async () => {
        try {
            setLoading(true);
            
            if (!formState.servicoId || (!formState.profissionalId && type === 'e')) {
                showErrorToast("Selecione o serviço e o profissional");
                return;
            }
            
            // IMPORTANTE: Utilizando dados simulados para desenvolvimento
            // Remova este bloco quando a API estiver implementada
            console.warn("⚠️ USANDO DADOS SIMULADOS - API endpoint /profissional/dias-disponiveis não implementado");
            
            // Gerar datas disponíveis para os próximos 7 dias
            const mockAgenda = [];
            const today = moment();
            
            for (let i = 1; i <= 7; i++) {
                const date = moment(today).add(i, 'days');
                const dateKey = date.format('YYYY-MM-DD');
                
                // Gerar horários disponíveis entre 8h e 17h (a cada 30min)
                const availableSlots = [];
                const startTime = moment(date).hour(8).minute(0).second(0);
                const endTime = moment(date).hour(17).minute(0).second(0);
                
                while (startTime.isBefore(endTime)) {
                    availableSlots.push([startTime.toISOString()]);
                    startTime.add(30, 'minutes');
                }
                
                mockAgenda.push({ [dateKey]: availableSlots });
            }
            
            console.log("Datas disponíveis simuladas:", mockAgenda);
            setAvailableDates(mockAgenda);
            setStep(2);
            
            /* 
            // Comentado até que a API esteja implementada
            const { data } = await api.post('/agendamento/horarios-disponiveis', {
                estabelecimentoId: pageData.estabelecimento.id,
                profissionalId: formState.profissionalId,
                servicoId: formState.servicoId,
                data: moment().format('YYYY-MM-DD')
            });
            
            if (data.error) {
                showErrorToast(data.message || "Erro ao buscar datas disponíveis");
                return;
            }
            
            // Transform the response from the new endpoint format to the expected format
            const formattedTimes = data.horariosDisponiveis.map(time => [time]);
            const formattedAgenda = [{
                [data.data]: formattedTimes
            }];
            
            setAvailableDates(formattedAgenda || []);
            setStep(2);
            */
            
        } catch (error) {
            console.error("Erro ao buscar datas disponíveis:", error);
            showErrorToast("Não foi possível carregar as datas disponíveis");
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (date) => {
        // Mock available times for the selected date
        const mockTimes = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
        ];
        
        setAvailableHours(mockTimes.map(time => ({
            label: time,
            value: `${moment(date).format('YYYY-MM-DD')}T${time}:00`
        })));
        
        setFormState(prev => ({
            ...prev,
            data: date,
            horario: ''
        }));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            
            // Valida os campos necessários
            if (!formState.nome || !formState.email || !formState.telefone || 
                !formState.servicoId || !formState.profissionalId || 
                !formState.data || !formState.horario) {
                showErrorToast("Preencha todos os campos obrigatórios");
                return;
            }
            
            // IMPORTANTE: Utilizando dados simulados para desenvolvimento
            // Remova este bloco quando a API estiver implementada
            console.warn("⚠️ USANDO DADOS SIMULADOS - API endpoint /public/agendamento não implementado");
            
            // Simular resposta de agendamento bem-sucedido
            setTimeout(() => {
                // Criar objeto de agendamento simulado
                const mockAgendamentoData = {
                    id: 'mock-' + Math.floor(Math.random() * 1000),
                    estabelecimentoId: pageData.estabelecimento.id,
                    profissionalId: formState.profissionalId,
                    servicoId: formState.servicoId,
                    cliente: {
                        nome: formState.nome,
                        email: formState.email,
                        telefone: formState.telefone
                    },
                    data: formState.horario,
                    status: 'A',
                    createdAt: new Date().toISOString()
                };
                
                // Exibe sucesso e reseta formulário
                setAgendamentoSuccess(true);
                setAgendamentoData(mockAgendamentoData);
                showSuccessToast("Agendamento realizado com sucesso!");
                setSubmitting(false);
            }, 1500); // Simular um pequeno delay para feedback visual
            
            return; // Impede a execução do código abaixo durante o desenvolvimento
            
            /* 
            // Comentado até que a API esteja implementada
            // Cria o objeto de agendamento
            const agendamento = {
                estabelecimentoId: pageData.estabelecimento.id,
                profissionalId: formState.profissionalId,
                servicoId: formState.servicoId,
                cliente: {
                    nome: formState.nome,
                    email: formState.email,
                    telefone: formState.telefone
                },
                data: formState.horario // Já está no formato ISO
            };
            
            const { data } = await api.post('/public/agendamento', agendamento);
            
            if (data.error) {
                showErrorToast(data.message || "Erro ao criar agendamento");
                return;
            }
            
            // Exibe sucesso e reseta formulário
            setAgendamentoSuccess(true);
            setAgendamentoData(data.agendamento);
            showSuccessToast("Agendamento realizado com sucesso!");
            */
            
        } catch (error) {
            console.error("Erro ao criar agendamento:", error);
            showErrorToast("Não foi possível realizar o agendamento");
        } finally {
            // Comentado pois o finalmente é tratado dentro do timeout para o caso simulado
            // setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormState({
            nome: '',
            email: '',
            telefone: '',
            servicoId: '',
            profissionalId: type === 'p' ? formState.profissionalId : '',
            data: null,
            horario: '',
        });
        setAvailableHours([]);
        setStep(1);
        setAgendamentoSuccess(false);
        setAgendamentoData(null);
    };

    // Função para formatar data e hora de forma amigável
    const formatDateTime = (isoString) => {
        if (!isoString) return '';
        return moment(isoString).format('DD/MM/YYYY [às] HH:mm');
    };

    if (loading && !pageData.estabelecimento) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <Icon icon="spinner" spin style={{ fontSize: 40 }} />
                    <p className="mt-3">Carregando...</p>
                </div>
            </div>
        );
    }

    // Se o link não for válido
    if (!loading && (!pageData.estabelecimento || (type === 'p' && !pageData.profissional))) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <Icon icon="close-circle" style={{ fontSize: 60, color: '#f44336' }} />
                    <h2 className="text-2xl font-bold mt-4 mb-2">Link inválido</h2>
                    <p className="text-gray-600 mb-6">O link que você acessou não é válido ou não existe mais.</p>
                    <Button appearance="primary" color="blue" href="/">
                        Voltar para o início
                    </Button>
                </div>
            </div>
        );
    }

    // Tela de sucesso após agendamento
    if (agendamentoSuccess && agendamentoData) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <div className="text-center mb-6">
                            <Icon icon="check-circle" style={{ fontSize: 60, color: '#4caf50' }} />
                            <h2 className="text-2xl font-bold mt-4">Agendamento confirmado!</h2>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h3 className="font-semibold text-lg mb-3">Detalhes do agendamento</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-600">Estabelecimento:</p>
                                    <p className="font-medium">{pageData.estabelecimento.nome}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Profissional:</p>
                                    <p className="font-medium">{pageData.profissional?.nome}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Serviço:</p>
                                    <p className="font-medium">
                                        {pageData.servicos.find(s => s.id === formState.servicoId)?.titulo}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Data e hora:</p>
                                    <p className="font-medium">{formatDateTime(agendamentoData.data)}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h3 className="font-semibold text-lg mb-3">Seus dados</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-600">Nome:</p>
                                    <p className="font-medium">{formState.nome}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Email:</p>
                                    <p className="font-medium">{formState.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Telefone:</p>
                                    <p className="font-medium">{formState.telefone}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <p className="text-gray-600 mb-4">
                                Um email com os detalhes do seu agendamento foi enviado para o seu endereço de email.
                            </p>
                            <Button appearance="primary" color="blue" onClick={resetForm}>
                                Fazer novo agendamento
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Mock data for services
    const mockServices = [
        {
            id: "CB",
            title: "Combo Cabelo e Barba",
            duration: "1h",
            price: 70.00
        },
        {
            id: "B",
            title: "Corte de Barba",
            duration: "30 min",
            price: 30.00
        },
        {
            id: "C",
            title: "Corte de Cabelo",
            duration: "30 min",
            price: 50.00
        },
        {
            id: "M",
            title: "Modelagem",
            duration: "30 min",
            price: 20.00
        }
    ];

    // Mock data for professionals
    const mockProfessionals = [
        {
            id: 1,
            name: "Maria",
            specialty: "Cabeleireira"
        }
    ];

    const renderHomeScreen = () => (
        <div className="p-4 flex flex-col h-full bg-gray-50">
            {/* Hero Section */}
            <div className="relative h-48 rounded-xl overflow-hidden mb-8 shadow-lg">
                <img 
                    src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3"
                    alt={pageData.estabelecimento?.nome}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                    <div className="text-white">
                        <h1 className="text-2xl font-bold mb-1">{pageData.estabelecimento?.nome}</h1>
                        <div className="flex items-center gap-2">
                            <Icon icon="map-marker" className="text-orange-400" />
                            <span className="text-sm opacity-90">{pageData.estabelecimento?.endereco}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                    onClick={() => setCurrentScreen('agendar')}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm transition-all hover:shadow-md"
                >
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                        <Icon icon="clock-o" style={{ fontSize: 24 }} className="text-orange-600" />
                    </div>
                    <span className="font-medium text-gray-800">Agendar</span>
                </button>
                <button 
                    onClick={() => setCurrentScreen('reservas')}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm transition-all hover:shadow-md"
                >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                        <Icon icon="calendar" style={{ fontSize: 24 }} className="text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-800">Reservas</span>
                </button>
            </div>

            {/* Services Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Serviços Populares</h2>
                <div className="space-y-3">
                    {pageData.servicos.slice(0, 3).map(service => (
                        <div key={service.id} 
                             className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                            <div>
                                <p className="font-medium text-gray-800">{service.titulo}</p>
                                <p className="text-sm text-gray-500">{service.duracao}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-orange-600">
                                    R$ {service.preco.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderReservasScreen = () => (
        <div className="bg-gray-50 min-h-full p-4">
            <div className="space-y-4">
                {mockReservations.map(reservation => (
                    <div key={reservation.id} 
                         className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-800">
                                    {reservation.servicoNome}
                                </h3>
                                <p className="text-gray-500">
                                    com {reservation.profissionalNome}
                                </p>
                            </div>
                            <span className={`
                                px-3 py-1 rounded-full text-sm font-medium
                                ${reservation.status === 'confirmado' 
                                    ? 'bg-green-50 text-green-700' 
                                    : reservation.status === 'pendente' 
                                    ? 'bg-yellow-50 text-yellow-700'
                                    : 'bg-gray-50 text-gray-700'
                                }
                            `}>
                                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="space-y-1">
                                <p className="text-gray-500">Data</p>
                                <p className="font-medium text-gray-800">
                                    {moment(reservation.data).format('DD/MM/YYYY')}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-500">Horário</p>
                                <p className="font-medium text-gray-800">
                                    {moment(reservation.data).format('HH:mm')}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-500">Valor</p>
                                <p className="font-medium text-orange-600">
                                    R$ {reservation.valor.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Update the header and navigation
    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {currentScreen !== 'inicio' && (
                <header className="bg-white border-b border-gray-100 p-4 flex items-center sticky top-0 z-10">
                    <button 
                        onClick={() => setCurrentScreen('inicio')} 
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 mr-3"
                    >
                        <Icon icon="arrow-left" className="text-gray-600" />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-800">
                        {currentScreen === 'agendar' ? 'Novo Agendamento' : 'Minhas Reservas'}
                    </h1>
                </header>
            )}

            <main className="flex-1 overflow-y-auto">
                {currentScreen === 'inicio' && renderHomeScreen()}
                {currentScreen === 'agendar' && (
                    <div className="p-4">
                        {step === 1 && (
                            <div className="p-4">
                                <h2 className="text-lg font-medium mb-4 text-center">Escolha uma opção</h2>
                                <div className="space-y-4">
                                    {mockServices.map(service => (
                                        <div 
                                            key={service.id}
                                            onClick={() => {
                                                setFormState({...formState, servicoId: service.id});
                                                setStep(2);
                                            }}
                                            className="flex items-center justify-between p-4 bg-white border-b cursor-pointer"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white">
                                                    {service.id}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium">{service.title}</div>
                                                    <div className="text-sm text-gray-500">{service.duration}</div>
                                                    <div className="text-sm">R$ {service.price.toFixed(2)}</div>
                                                </div>
                                            </div>
                                            <Icon icon="angle-right" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="p-4">
                                <h2 className="text-lg font-medium mb-4 text-center">Escolha uma opção</h2>
                                <div className="space-y-4">
                                    {mockProfessionals.map(professional => (
                                        <div 
                                            key={professional.id}
                                            onClick={() => {
                                                setFormState({...formState, profissionalId: professional.id});
                                                setStep(3);
                                            }}
                                            className="flex items-center justify-between p-4 bg-white border-b cursor-pointer"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <Icon icon="user" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium">{professional.name}</div>
                                                    <div className="text-sm text-gray-500">{professional.specialty}</div>
                                                </div>
                                            </div>
                                            <Icon icon="angle-right" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="p-4">
                                {/* Service Summary */}
                                <div className="mb-6">
                                    <div className="flex items-center mb-4">
                                        <button 
                                            onClick={() => setStep(1)} 
                                            className="text-gray-600 mr-2"
                                        >
                                            <Icon icon="arrow-left" />
                                        </button>
                                        <div>
                                            <h2 className="text-xl font-semibold">{
                                                mockServices.find(s => s.id === formState.servicoId)?.title || 'Serviço'
                                            }</h2>
                                            <p className="text-gray-500">
                                                com {mockProfessionals.find(p => p.id === formState.profissionalId)?.name}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-gray-50 rounded-lg mb-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-gray-500">Duração</p>
                                                <p className="font-medium">
                                                    {mockServices.find(s => s.id === formState.servicoId)?.duration}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Valor</p>
                                                <p className="font-medium">
                                                    R$ {mockServices.find(s => s.id === formState.servicoId)?.price.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Date Selection */}
                                <div className="mb-6">
                                    <h3 className="font-medium mb-3">Escolha uma data</h3>
                                    <input 
                                        type="date"
                                        className="w-full p-3 border rounded-lg bg-white"
                                        onChange={(e) => handleDateSelect(e.target.value)}
                                        min={moment().add(1, 'day').format('YYYY-MM-DD')}
                                    />
                                </div>
                                
                                {/* Time Slots */}
                                {formState.data && (
                                    <div>
                                        <h3 className="font-medium mb-3">Horários disponíveis</h3>
                                        <p className="text-gray-500 mb-3">{moment(formState.data).format('dddd, DD [de] MMMM')}</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableHours.map((time, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setFormState(prev => ({ ...prev, horario: time.value }))}
                                                    className={`
                                                        p-3 rounded-lg text-center transition-colors
                                                        ${formState.horario === time.value 
                                                            ? 'bg-orange-600 text-white' 
                                                            : 'bg-gray-100 hover:bg-gray-200'
                                                        }
                                                    `}
                                                >
                                                    {time.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Continue Button */}
                                {formState.data && formState.horario && (
                                    <div className="mt-6">
                                        <button
                                            onClick={handleSubmit}
                                            className="w-full p-4 bg-orange-600 text-white rounded-lg font-medium"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Confirmando...' : 'Confirmar horário'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {currentScreen === 'reservas' && renderReservasScreen()}
            </main>

            <nav className="bg-white border-t border-gray-100 flex justify-around p-3 sticky bottom-0">
                <button 
                    onClick={() => setCurrentScreen('inicio')}
                    className={`flex flex-col items-center px-4 py-1 rounded-lg transition-colors
                        ${currentScreen === 'inicio' ? 'text-orange-600' : 'text-gray-600 hover:text-gray-800'}`}
                >
                    <Icon icon="home" style={{ fontSize: 20 }} />
                    <span className="text-xs mt-1 font-medium">Início</span>
                </button>
                <button 
                    onClick={() => setCurrentScreen('agendar')}
                    className={`flex flex-col items-center px-4 py-1 rounded-lg transition-colors
                        ${currentScreen === 'agendar' ? 'text-orange-600' : 'text-gray-600 hover:text-gray-800'}`}
                >
                    <Icon icon="clock-o" style={{ fontSize: 20 }} />
                    <span className="text-xs mt-1 font-medium">Agendar</span>
                </button>
                <button 
                    onClick={() => setCurrentScreen('reservas')}
                    className={`flex flex-col items-center px-4 py-1 rounded-lg transition-colors
                        ${currentScreen === 'reservas' ? 'text-orange-600' : 'text-gray-600 hover:text-gray-800'}`}
                >
                    <Icon icon="calendar" style={{ fontSize: 20 }} />
                    <span className="text-xs mt-1 font-medium">Reservas</span>
                </button>
            </nav>
        </div>
    );
};

export default PublicScheduling;