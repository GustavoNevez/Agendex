import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Button, Icon, SelectPicker, DatePicker, Panel } from 'rsuite';
import api from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../utils/notifications';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'rsuite/dist/styles/rsuite-default.css';

// Configure moment para português
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
        const formattedDate = moment(date).format('YYYY-MM-DD');
        
        // Busca os horários disponíveis para a data selecionada
        const dateData = availableDates.find(d => Object.keys(d)[0] === formattedDate);
        
        if (dateData) {
            const hours = dateData[formattedDate].map(h => ({
                label: moment(h[0]).format('HH:mm'),
                value: h[0]
            }));
            
            setAvailableHours(hours);
            setFormState(prev => ({
                ...prev,
                data: date,
                horario: ''
            }));
        }
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
            // Comentado pois o finally é tratado dentro do timeout para o caso simulado
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

    return (
        <div className="min-h-screen bg-gray-900 py-8 px-4 text-white">
            <div className="max-w-3xl mx-auto">
                {/* Header Card with Business Info - Better desktop layout */}
                <div className="bg-gray-800 p-5 sm:p-6 rounded-xl shadow-lg mb-6 overflow-hidden">
                    {/* Better responsive layout for desktop and mobile */}
                    <div className="flex flex-col items-center text-center mb-5">
                        {/* Logo Circle - Consistent size */}
                        <div className="w-24 h-24 rounded-full bg-black border-4 border-gray-700 shadow-md overflow-hidden mb-4">
                            <img 
                                src="/logo.png" 
                                alt="Logo" 
                                className="w-full h-full object-contain" 
                            />
                        </div>
                        
                        {/* Establishment Info */}
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                {pageData.estabelecimento?.nome}
                            </h1>
                            
                            {type === 'p' && pageData.profissional && (
                                <p className="text-gray-400 mt-1">
                                    Profissional: {pageData.profissional.nome} - {pageData.profissional.especialidade}
                                </p>
                            )}
                            
                            {/* Rating Stars */}
                            <div className="flex items-center justify-center mt-2">
                                <div className="flex text-yellow-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                                <span className="ml-2 text-white font-medium">5.0</span>
                                <span className="ml-1 text-gray-400 text-sm">(5 avaliações)</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Contact Options - Centered and optimized */}
                    <div className="flex justify-center gap-4 px-4">
                        <a href={`https://wa.me/${pageData.estabelecimento?.telefone?.replace(/\D/g, '') || ''}`} 
                           className="flex-1 max-w-[180px] flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors text-white"
                           target="_blank"
                           rel="noopener noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                            </svg>
                            WhatsApp
                        </a>
                        <a href="https://www.instagram.com/" 
                           className="flex-1 max-w-[180px] flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-colors text-white"
                           target="_blank"
                           rel="noopener noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/>
                            </svg>
                            Instagram
                        </a>
                    </div>
                </div>

                {/* Tab Navigation - Highly responsive with no overflow issues */}
                <div className="grid grid-cols-3 mb-6 rounded-lg overflow-hidden bg-gray-800 text-gray-300">
                    <div className="py-3 px-1 sm:px-2 text-center font-medium bg-gray-700 text-yellow-400">
                        <div className="flex flex-col sm:flex-row items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            <span className="text-xs sm:text-sm md:text-base mt-1 sm:mt-0">Serviços</span>
                        </div>
                    </div>
                    <div className="py-3 px-1 sm:px-2 text-center font-medium">
                        <div className="flex flex-col sm:flex-row items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs sm:text-sm md:text-base mt-1 sm:mt-0">Horários</span>
                        </div>
                    </div>
                    <div className="py-3 px-1 sm:px-2 text-center font-medium">
                        <div className="flex flex-col sm:flex-row items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            <span className="text-xs sm:text-sm md:text-base mt-1 sm:mt-0">Local</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-gray-800 rounded-xl shadow-lg mb-6 overflow-hidden">
                    <h2 className="text-2xl font-bold text-center text-white py-4 border-b border-gray-700">Serviços Oferecidos</h2>
                    
                    <div className="p-4">
                        {/* Progress Steps - Dark themed */}
                        {step !== 1 && (
                            <div className="flex mb-6">
                                <div className={`flex-1 text-center pb-4 relative ${step >= 1 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${step >= 1 ? 'bg-gray-700 text-yellow-400' : 'bg-gray-600 text-gray-400'}`}>
                                        <Icon icon="list" />
                                    </div>
                                    <div className="mt-2">Serviço</div>
                                    {step > 1 && <div className="absolute w-1/2 h-1 bg-yellow-400 top-5 left-1/2"></div>}
                                </div>
                                <div className={`flex-1 text-center pb-4 relative ${step >= 2 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${step >= 2 ? 'bg-gray-700 text-yellow-400' : 'bg-gray-600 text-gray-400'}`}>
                                        <Icon icon="calendar" />
                                    </div>
                                    <div className="mt-2">Data/Hora</div>
                                    {step > 2 && <div className="absolute w-1/2 h-1 bg-yellow-400 top-5 left-1/2"></div>}
                                </div>
                                <div className={`flex-1 text-center pb-4 ${step >= 3 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${step >= 3 ? 'bg-gray-700 text-yellow-400' : 'bg-gray-600 text-gray-400'}`}>
                                        <Icon icon="check" />
                                    </div>
                                    <div className="mt-2">Confirmação</div>
                                </div>
                            </div>
                        )}
                        
                        {/* Passo 1: Seleção de serviço e profissional - Matched to reference */}
                        {step === 1 && (
                            <div>
                                {/* Service Cards Grid - Exact match to reference */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {pageData.servicos.map(serv => (
                                        <div 
                                            key={serv.id}
                                            className={`relative overflow-hidden cursor-pointer transition-all ${
                                                formState.servicoId === serv.id 
                                                ? 'bg-gray-700 border-l-4 border-yellow-400' 
                                                : 'bg-gray-700 hover:bg-gray-600'
                                            }`}
                                            onClick={() => setFormState({...formState, servicoId: serv.id})}
                                        >
                                            <div className="px-4 py-5">
                                                <h3 className="text-lg font-bold text-white mb-1">{serv.titulo}</h3>
                                                
                                                <div className="flex items-center text-gray-400 mb-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-sm">
                                                        {serv.duracao
                                                            ? moment.duration(serv.duracao).asMinutes()
                                                            : 30} minutos
                                                    </span>
                                                </div>
                                                
                                                <div className="text-xl font-bold text-yellow-400">
                                                    R$ {parseFloat(serv.preco).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Professional selection (only for establishment links) */}
                                {type === 'e' && (
                                    <div className="mt-8 mb-6">
                                        <h3 className="text-lg font-semibold mb-4 text-white text-center">Selecione o profissional</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {pageData.profissionais.map(prof => (
                                                <div 
                                                    key={prof.id}
                                                    className={`p-4 rounded cursor-pointer transition-all ${
                                                        formState.profissionalId === prof.id 
                                                        ? 'bg-gray-700 border-l-4 border-yellow-400' 
                                                        : 'bg-gray-700 hover:bg-gray-600'
                                                    }`}
                                                    onClick={() => setFormState({...formState, profissionalId: prof.id})}
                                                >
                                                    <div className="flex items-center">
                                                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden mr-3">
                                                            <Icon icon="user" style={{ fontSize: '24px', color: '#fff' }} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-white">{prof.nome}</h4>
                                                            <p className="text-sm text-gray-400">{prof.especialidade}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="mt-8 text-center">
                                    <Button 
                                        appearance="primary" 
                                        color="yellow"
                                        size="lg"
                                        onClick={fetchAvailableDates}
                                        disabled={!formState.servicoId || (type === 'e' && !formState.profissionalId) || loading}
                                        loading={loading}
                                    >
                                        Continuar
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        {/* Passo 2: Seleção de data e hora - Dark theme */}
                        {step === 2 && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-center w-full text-white">Selecione a data e hora</h3>
                                </div>
                                
                                <div className="flex flex-col md:flex-row gap-6 mb-6">
                                    <div className="flex-1">
                                        <div className="bg-gray-700 p-4 rounded mb-4 border-l-4 border-yellow-400">
                                            <div className="flex items-center text-yellow-400 mb-3">
                                                <Icon icon="info-circle" style={{ marginRight: '8px' }} />
                                                <span className="font-medium">Serviço selecionado</span>
                                            </div>
                                            <div className="pl-6">
                                                <p className="font-semibold text-white">{pageData.servicos.find(s => s.id === formState.servicoId)?.titulo}</p>
                                                <p className="text-gray-400">
                                                    {type === 'e' 
                                                        ? `Profissional: ${pageData.profissionais.find(p => p.id === formState.profissionalId)?.nome}` 
                                                        : `Profissional: ${pageData.profissional?.nome}`}
                                                </p>
                                                <p className="font-medium text-yellow-400 mt-1">
                                                    R$ {parseFloat(pageData.servicos.find(s => s.id === formState.servicoId)?.preco || 0).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <Button 
                                            appearance="link" 
                                            className="mb-4 text-gray-300"
                                            onClick={() => setStep(1)}
                                        >
                                            <Icon icon="arrow-left" style={{ marginRight: '5px' }} /> Voltar e alterar serviço
                                        </Button>
                                    </div>
                                    
                                    <div className="flex-1 bg-gray-700 rounded p-5">
                                        <h4 className="font-semibold mb-3 text-white">Selecione uma data</h4>
                                        <DatePicker 
                                            value={formState.data}
                                            onChange={handleDateSelect}
                                            format="DD/MM/YYYY"
                                            placeholder="Selecione uma data"
                                            ranges={[]}
                                            block
                                            className="mb-4"
                                            disabledDate={date => {
                                                // Desabilita datas que não estão disponíveis
                                                const formattedDate = moment(date).format('YYYY-MM-DD');
                                                return !availableDates.some(d => Object.keys(d)[0] === formattedDate);
                                            }}
                                        />
                                        
                                        {formState.data && (
                                            <>
                                                <h4 className="font-semibold mb-3 text-white">Horários disponíveis</h4>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {availableHours.map((hour, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`p-2 text-center rounded cursor-pointer transition-colors ${
                                                                formState.horario === hour.value 
                                                                    ? 'bg-yellow-400 text-gray-800' 
                                                                    : 'bg-gray-600 hover:bg-gray-500 text-white'
                                                            }`}
                                                            onClick={() => setFormState({...formState, horario: hour.value})}
                                                        >
                                                            {hour.label}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="text-center">
                                    <Button 
                                        appearance="primary" 
                                        color="yellow" 
                                        size="lg"
                                        onClick={() => setStep(3)}
                                        disabled={!formState.data || !formState.horario}
                                    >
                                        Continuar
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        {/* Passo 3: Informações do cliente e confirmação - Dark theme */}
                        {step === 3 && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-center w-full text-white">Confirme seu agendamento</h3>
                                </div>
                                
                                <div className="mb-6 bg-gray-700 p-5 rounded border-l-4 border-yellow-400">
                                    <h4 className="font-bold text-lg mb-4 text-white">Resumo do agendamento</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-600 p-3 rounded">
                                            <p className="text-gray-300 text-sm">Estabelecimento</p>
                                            <p className="font-medium text-white">{pageData.estabelecimento.nome}</p>
                                        </div>
                                        <div className="bg-gray-600 p-3 rounded">
                                            <p className="text-gray-300 text-sm">Profissional</p>
                                            <p className="font-medium text-white">
                                                {type === 'p' 
                                                    ? pageData.profissional.nome 
                                                    : pageData.profissionais.find(p => p.id === formState.profissionalId)?.nome}
                                            </p>
                                        </div>
                                        <div className="bg-gray-600 p-3 rounded">
                                            <p className="text-gray-300 text-sm">Serviço</p>
                                            <p className="font-medium text-white">
                                                {pageData.servicos.find(s => s.id === formState.servicoId)?.titulo}
                                            </p>
                                        </div>
                                        <div className="bg-gray-600 p-3 rounded">
                                            <p className="text-gray-300 text-sm">Valor</p>
                                            <p className="font-medium text-yellow-400">
                                                R$ {parseFloat(pageData.servicos.find(s => s.id === formState.servicoId)?.preco || 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="bg-gray-600 p-3 rounded">
                                            <p className="text-gray-300 text-sm">Data</p>
                                            <p className="font-medium text-white">{formState.data ? moment(formState.data).format('DD/MM/YYYY') : ''}</p>
                                        </div>
                                        <div className="bg-gray-600 p-3 rounded">
                                            <p className="text-gray-300 text-sm">Horário</p>
                                            <p className="font-medium text-white">{formState.horario ? moment(formState.horario).format('HH:mm') : ''}</p>
                                        </div>
                                    </div>
                                    
                                    <Button 
                                        appearance="link" 
                                        className="mt-4 text-gray-300"
                                        onClick={() => setStep(2)}
                                    >
                                        <Icon icon="arrow-left" style={{ marginRight: '5px' }} /> Voltar e alterar data/hora
                                    </Button>
                                </div>
                                
                                <div className="bg-gray-700 p-5 rounded mb-6">
                                    <h4 className="font-bold text-lg mb-4 text-white">Suas informações</h4>
                                    
                                    <div className="mb-4">
                                        <label className="block text-gray-300 mb-2">Nome completo *</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 rounded bg-gray-600 border border-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            placeholder="Seu nome completo"
                                            value={formState.nome}
                                            onChange={(e) => setFormState({...formState, nome: e.target.value})}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="block text-gray-300 mb-2">Email *</label>
                                        <input
                                            type="email"
                                            className="w-full p-3 rounded bg-gray-600 border border-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            placeholder="Seu email"
                                            value={formState.email}
                                            onChange={(e) => setFormState({...formState, email: e.target.value})}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="mb-2">
                                        <label className="block text-gray-300 mb-2">Telefone *</label>
                                        <input
                                            type="tel"
                                            className="w-full p-3 rounded bg-gray-600 border border-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            placeholder="(00) 00000-0000"
                                            value={formState.telefone}
                                            onChange={(e) => setFormState({...formState, telefone: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="text-center">
                                    <Button 
                                        appearance="primary" 
                                        color="yellow"
                                        size="lg"
                                        onClick={handleSubmit}
                                        disabled={!formState.nome || !formState.email || !formState.telefone || submitting}
                                        loading={submitting}
                                    >
                                        Confirmar Agendamento
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicScheduling;