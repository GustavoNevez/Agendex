import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Button, SelectPicker, DatePicker, Modal, Icon, Panel } from 'rsuite';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'rsuite/dist/styles/rsuite-default.css';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPublicData,
    checkAvailability,
    createAppointment,
    fetchClientAppointments,
} from '../../store/modules/public/actions';
import CustomDatePicker from '../../components/DataPicker/dataPicker_widget';

moment.locale('pt-br');

const PublicScheduling = () => {
    const { customLink } = useParams();
    const location = useLocation();

    // Determine the type from the URL path instead of route params
    const type = location.pathname.includes('/public/e/') ? 'e' : 'p';

    const [loading, setLoading] = useState(true);
    const [formState, setFormState] = useState({
        nome: '',
        email: '',
        telefone: '',
        servicoId: '',
        profissionalId: '',
        data: null,
        horario: '',
    });

    const [availableHours, setAvailableHours] = useState([]);
    const [step, setStep] = useState(1); // 1: Seleção do serviço, 2: Seleção de data/hora, 3: Confirmação
    const [submitting, setSubmitting] = useState(false);
    const [agendamentoSuccess, setAgendamentoSuccess] = useState(false);
    const [agendamentoData, setAgendamentoData] = useState(null);
    const [currentScreen, setCurrentScreen] = useState('inicio'); // 'inicio', 'agendar', 'reservas', 'mais'

    const dispatch = useDispatch();
    const { publicData, availability, clientAppointments } = useSelector((state) => state.public);

    const fetchInitialData = () => {
        dispatch(fetchPublicData(customLink, type));
    };

    const fetchAvailableDates = () => {
        if (!formState.servicoId || (!formState.profissionalId && type === 'e')) {
            return;
        }

        dispatch(checkAvailability({
            estabelecimentoId: publicData.estabelecimento.id,
            servicoId: formState.servicoId,
            profissionalId: formState.profissionalId,
            data: formState.data ? moment(formState.data).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
        }));
    };

    // Atualiza os horários disponíveis sempre que a disponibilidade no Redux mudar
    useEffect(() => {
        if (availability) {
            setLoading(true);
            // Pequeno delay para simular carregamento visualmente perceptível
            const timeout = setTimeout(() => {
                setAvailableHours(availability);
                setLoading(false);
            }, 300); // Ajuste o tempo conforme o necessário

            return () => clearTimeout(timeout);
        }
    }, [availability]);


    // Atualiza os horários disponíveis sempre que a data for alterada
    useEffect(() => {
        if (formState.data) {
            fetchAvailableDates();
        }
    }, [formState.data]);

    // Função para ajustar a data local para o formato esperado pelo backend
    const adjustTimeToServer = (localTime) => {
        return moment(localTime).subtract(3, 'hours'); // Ajuste de fuso horário (UTC-3 para UTC-7)
    };

    const handleSubmit = () => {
        setSubmitting(true);

        // Ajustar a data e horário antes de enviar
        const localDateTime = moment(`${moment(formState.data).format('YYYY-MM-DD')}T${formState.horario}`);
        const serverDateTime = adjustTimeToServer(localDateTime);

        dispatch(createAppointment({
            estabelecimentoId: publicData.estabelecimento.id,
            servicoId: formState.servicoId,
            profissionalId: formState.profissionalId,
            data: serverDateTime.toISOString(), // Enviar no formato ISO
            nome: formState.nome,
            email: formState.email,
            telefone: formState.telefone,
        }));



        // Mock successful response for now - in real implementation this would be handled by Redux
        setTimeout(() => {
            setAgendamentoSuccess(true);
            setAgendamentoData({
                data: formState.horario,
                status: 'confirmado'
            });
            setSubmitting(false);
        }, 1000);
    };

    const fetchReservations = () => {
        dispatch(fetchClientAppointments({
            email: formState.email,
            telefone: formState.telefone,
            estabelecimentoId: publicData.estabelecimento.id,
        }));
    };

    useEffect(() => {
        fetchInitialData();
    }, [customLink, type]);

    useEffect(() => {
        if (publicData && !publicData.error) {
            setLoading(false);
        }
    }, [publicData]);

    const handleDateSelect = (date) => {
        setFormState((prev) => ({
            ...prev,
            data: date,
            horario: '',
        }));
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

    const formatServiceDuration = (isoString) => {
        if (!isoString) return '';
        const adjustedTime = moment(isoString);
        return adjustedTime.format('HH:mm');
    };



    if (loading && !publicData?.estabelecimento) {
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


    // Tela de sucesso após agendamento
    if (agendamentoSuccess && agendamentoData) {
        return (
            <Modal show={agendamentoSuccess} onHide={resetForm}>
                <Modal.Header>
                    <Modal.Title>Agendamento confirmado!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Detalhes do agendamento:</p>
                    <p>Data e hora: {formatDateTime(agendamentoData.data)}</p>
                    <p>Estabelecimento: {publicData.estabelecimento.nome}</p>
                    <p>Serviço: {publicData.servicos.find(s => s.id === formState.servicoId)?.titulo}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={resetForm} appearance="primary">
                        Fazer novo agendamento
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    const renderHomeScreen = () => (
        <div className="p-4 flex flex-col items-center h-full bg-gray-50 overflow-y-auto" style={{ animation: 'fadeIn 0.4s ease-in-out' }}>

            {/* Imagem de perfil */}
            <div className="mt-6 mb-4">
                <img
                    src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3"
                    alt="Perfil"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                />
            </div>

            {/* Nome */}
            <h1 className="text-xl font-bold text-center text-gray-800 mb-1">
                {publicData.estabelecimento?.nome}
            </h1>

            {/* Localização */}
            <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-4">
                <Icon icon="map-marker" className="text-orange-500" />
                <span>{publicData.estabelecimento?.endereco} Rua Saldanha Marinhao 2341 </span>
            </div>

            {/* Botões: WhatsApp + Maps */}
            <div className="flex gap-4 ">
                <a
                    href={`https://wa.me/${publicData.estabelecimento?.telefone || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full shadow hover:bg-green-600 transition"
                >
                    <Icon icon="whatsapp" />
                    WhatsApp
                </a>
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(publicData.estabelecimento?.endereco || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition"
                >
                    <Icon icon="map" />
                    Ver no Mapa
                </a>
            </div>

            {/* Botões centrais: Agendar / Reservas */}
            <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-md ">
                <button
                    onClick={() => setCurrentScreen('agendar')}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md active:bg-gray-100"
                >
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                        <Icon icon="clock-o" style={{ fontSize: 30 }} className="text-orange-600" />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">Agendar</span>
                </button>
                <button
                    onClick={() => setCurrentScreen('reservas')}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md active:bg-gray-100"
                >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                        <Icon icon="calendar" style={{ fontSize: 30 }} className="text-blue-600" />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">Reservas</span>
                </button>
            </div>
        </div>
    );

    const serviceSumaryScreen = () => (

        <div className="bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer mb-6">
            <div className="flex items-stretch border-l-4 border-indigo-500" >

                {/* Lateral roxa com Duração e tempo */}
                <div className="bg-indigo-50 px-4 py-3 flex flex-col items-center justify-center min-w-[80px]">
                    <span className="text-indigo-800 text-xs font-semibold mb-1">Duração</span>
                    <span className="text-indigo-800 font-bold text-base text-center leading-tight">
                        {formatServiceDuration(
                            publicData.servicos.find(s => s.id === formState.servicoId)?.duracao
                        ) || '00:00'}
                    </span>
                </div>

                {/* Conteúdo principal */}
                <div className="flex-1 p-4 pt-3">
                    {/* Título e profissional */}
                    <div className="mb-3">
                        <h2 className="text-lg font-bold text-gray-900">
                            {publicData.servicos.find(s => s.id === formState.servicoId)?.titulo || 'Serviço'}
                        </h2>
                        <p className="text-gray-700 text-sm">
                            com <span className="font-semibold">
                                {type === 'p'
                                    ? publicData.profissional?.nome
                                    : publicData.profissionais.find(p => p.id === formState.profissionalId)?.nome || 'Profissional'}
                            </span>
                        </p>
                    </div>

                    {/* Valor na mesma linha */}
                    <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm flex justify-between items-center border-rounded border border-gray-100">
                        <span className="font-bold text-gray-900">Valor:</span>
                        <span className="font-medium">
                            R$ {publicData.servicos.find(s => s.id === formState.servicoId)?.preco.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderReservasScreen = () => (
        <div className="bg-gray-50 min-h-full p-4">
            <div className="space-y-4">
                {clientAppointments && clientAppointments.length > 0 ? (
                    clientAppointments.map(reservation => (
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
                    ))
                ) : (
                    <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon icon="calendar" style={{ fontSize: 24 }} className="text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Nenhuma reserva encontrada</h3>
                        <p className="text-gray-500 mb-4">Você ainda não possui agendamentos realizados.</p>
                        <Button
                            appearance="primary"
                            color="orange"
                            onClick={() => setCurrentScreen('agendar')}
                        >
                            Fazer um agendamento
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderDatePicker = () => (
        <CustomDatePicker
            onChange={(value) => handleDateSelect(value)}
            disabledDate={(date) => date <= moment().toDate()}
        />
    );

    const renderTimeBlocks = () => {
        if (loading) {
            return (
                <div className="p-4 flex flex-col items-center h-full bg-gray-50 overflow-y-auto">
                    <span className="text-gray-500 mb-2">Carregando horários...</span>
                    <div className="w-6 h-6 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            );
        }

        if (availableHours.length === 0) {
            return (
                <div className="p-4 flex flex-col items-center h-full bg-gray-50 text-center animate-fadeIn">
                    <p className="text-gray-600 text-base font-medium">
                        Nenhum horário disponível no momento 😕
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        Tente outro dia ou volte mais tarde.
                    </p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4 " style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                {availableHours.map((hour, index) => (
                    <button
                        key={index}
                        onClick={() =>
                            setFormState((prev) => ({ ...prev, horario: hour }))
                        }
                        className={`p-3 rounded-lg text-center border font-bold transition-all 
                            ${formState.horario === hour
                                ? 'bg-violet-500 text-white border-orange-600'
                                : 'bg-white text-gray-800 hover:bg-orange-50 border-gray-200 '}
                        `}
                    >
                        {hour}
                    </button>
                ))}
            </div>
        );
    };



    const renderUserForm = () => (
        <Panel bordered header="Seus dados">
            <div className="mb-3">
                <label>Nome completo</label>
                <input
                    type="text"
                    className="rs-input"
                    value={formState.nome}
                    onChange={(e) => setFormState({ ...formState, nome: e.target.value })}
                    placeholder="Digite seu nome completo"
                />
            </div>
            <div className="mb-3">
                <label>Email</label>
                <input
                    type="email"
                    className="rs-input"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="Digite seu email"
                />
            </div>
            <div className="mb-3">
                <label>Telefone</label>
                <input
                    type="tel"
                    className="rs-input"
                    value={formState.telefone}
                    onChange={(e) => setFormState({ ...formState, telefone: e.target.value })}
                    placeholder="Digite seu telefone"
                />
            </div>
        </Panel>
    );

    return (
        <div className="flex flex-col h-screen bg-gray-50 ">
            {currentScreen !== 'inicio' && (
                <header className="bg-white border-b border-gray-100 p-3 flex items-center sticky top-0 z-10 ">
                    <div className="relative mr-3">
                        <button
                            onClick={() => {
                                if (step === 3) {
                                    setStep(type === 'p' ? 1 : 2);
                                } else if (step === 2) {
                                    setStep(1);
                                } else {
                                    setCurrentScreen('inicio');
                                }
                            }}
                            className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 shadow-sm focus:outline-none"
                        >
                            <Icon icon="arrow-left" className="text-lg" />
                        </button>

                    </div>

                    <h1 className="text-xl font-semibold text-gray-800 pl-2 ">
                        {currentScreen === 'agendar' ? 'Novo Agendamento' : 'Minhas Reservas'}
                    </h1>
                </header>



            )}

            <main className="flex-1 overflow-y-auto" >
                {currentScreen === 'inicio' && renderHomeScreen()}
                {currentScreen === 'agendar' && (
                    <div className="p-2" >
                        {step === 1 && (
                            <div className="p-4" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                                <h2 className="text-xl text-gray-900 font-bold mb-3 text-center">Escolha um serviço</h2>
                                <div className="space-y-4" >
                                    {publicData.servicos.map(service => (
                                        <div
                                            key={service.id}
                                            onClick={() => {
                                                setFormState({ ...formState, servicoId: service.id });
                                                setStep(type === 'p' ? 3 : 2); // Skip professional selection for direct professional links
                                            }}
                                            className="  flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md active:bg-gray-100 transition"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white">
                                                    {service.titulo.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-bold pb-1">{service.titulo}</div>
                                                    <div className="text-sm text-gray-500 pb-1"><p>Duração: {formatServiceDuration(service.duracao)} </p></div>
                                                    <div className="text-sm">R$ {service.preco.toFixed(2)}</div>
                                                </div>
                                            </div>
                                            <Icon icon="angle-right" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="p-4" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                                <h2 className="text-xl text-gray-900 font-bold mb-3 text-center">Escolha um profissional</h2>
                                <div className="space-y-4" >
                                    {publicData.profissionais.map(professional => (
                                        <div
                                            key={professional.id}
                                            onClick={() => {
                                                setFormState({ ...formState, profissionalId: professional.id });
                                                setStep(3);
                                                fetchAvailableDates();
                                            }}
                                            className=" flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md active:bg-gray-100 transition"
                                        >
                                            <div className="flex items-center ">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <Icon icon="user" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-bold pb-1">{professional.nome}</div>
                                                    <div className="text-sm text-gray-500">{professional.especialidade}</div>
                                                </div>
                                            </div>
                                            <Icon icon="angle-right " />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="p-4 " style={{ animation: 'fadeIn 0.4s ease-in-out' }}>
                                {/* Service Summary */}


                                {/* Date Selection */}
                                <div className="mb-6">
                                    <h3 className="text-xl text-gray-900 font-bold mb-3">Escolha uma data:</h3>
                                    {renderDatePicker()}
                                </div>

                                {/* Time Slots */}
                                {formState.data && (
                                    <div>
                                        <h3 className="text-xl text-gray-900 font-bold mb-3">Horários disponíveis:</h3>
                                        <p className="text-gray-500 mb-3">{moment(formState.data).format('dddd, DD [de] MMMM')}</p>
                                        {renderTimeBlocks()}
                                    </div>
                                )}

                                {/* User Information Form */}
                                {formState.horario && renderUserForm()}

                                {/* Continue Button */}
                                {formState.nome && formState.email && formState.telefone && formState.horario && (
                                    <div className="mt-6">
                                        <Button
                                            block
                                            appearance="primary"
                                            onClick={handleSubmit}
                                            loading={submitting}
                                        >
                                            Confirmar agendamento
                                        </Button>
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