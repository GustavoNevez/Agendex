import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Button, Icon } from 'rsuite';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'rsuite/dist/styles/rsuite-default.css';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPublicData,
    checkAvailability,
    createAppointment,
    registerClient,
    verifyClient,
    loginClient,
} from '../../store/modules/public/actions';
import CustomDatePicker from '../../components/DataPicker/dataPicker_widget';

moment.locale('pt-br');

// Utils
function maskPhone(value) {
    let digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
function formatPhoneToSend(value) {
    let digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length < 10) return '';
    return `+55 (${digits.slice(0, 2)})${digits.slice(2)}`;
}
const adjustTimeToServer = (localTime) => moment(localTime).subtract(3, 'hours');

// Adicionado: função utilitária para formatar duração do serviço
function formatServiceDuration(isoString) {
    if (!isoString) return '';
    const duration = moment.duration(isoString);
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    return `${hours > 0 ? `${hours}h` : ''}${minutes > 0 ? ` ${minutes}min` : ''}`.trim();
}

// Main Component
const PublicScheduling = () => {
    // --- Routing and Type ---
    const { customLink } = useParams();
    const location = useLocation();
    const type = location.pathname.includes('/public/e/') ? 'e' : 'p';

    // --- State ---
    const [loading, setLoading] = useState(true);
    const [formState, setFormState] = useState({
        nome: '',
        email: '',
        telefone: '',
        senha: '',
        confirmarSenha: '',
        servicoId: '',
        profissionalId: '',
        data: null,
        horario: '',
    });
    const [registrationError, setRegistrationError] = useState('');
    const [verificationStep, setVerificationStep] = useState(1);
    const [isRegistering, setIsRegistering] = useState(true);
    const [availableHours, setAvailableHours] = useState([]);
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [agendamentoData, setAgendamentoData] = useState(null);
    const [currentScreen, setCurrentScreen] = useState('inicio');
    const [smsCode, setSmsCode] = useState('');
    const [isVerifyingSms, setIsVerifyingSms] = useState(false);
    const [isSelectingDate, setIsSelectingDate] = useState(false);
    const [touchedFieldsRegister, setTouchedFieldsRegister] = useState({});
    const [touchedFieldsLogin, setTouchedFieldsLogin] = useState({});
    const [triedSubmitRegister, setTriedSubmitRegister] = useState(false);
    const [triedSubmitLogin, setTriedSubmitLogin] = useState(false);

    // --- Redux ---
    const dispatch = useDispatch();
    const { publicData, availability, clientAppointments, appointments, clientRegistration } = useSelector((state) => state.public);

    // --- Data Fetch ---
    useEffect(() => {
        dispatch(fetchPublicData(customLink, type));
    }, [customLink, type, dispatch]);

    useEffect(() => {
        if (publicData && !publicData.error) setLoading(false);
    }, [publicData]);

    // --- Availability ---
    const fetchAvailableDates = () => {
        if (!formState.servicoId || (!formState.profissionalId && type === 'e')) return;
        dispatch(checkAvailability({
            estabelecimentoId: publicData.estabelecimento.id,
            servicoId: formState.servicoId,
            profissionalId: formState.profissionalId,
            data: formState.data ? moment(formState.data).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
        }));
    };

    useEffect(() => {
        if (availability) {
            setLoading(true);
            const timeout = setTimeout(() => {
                setAvailableHours(availability);
                setLoading(false);
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [availability]);

    useEffect(() => {
        if (formState.data) fetchAvailableDates();
        // eslint-disable-next-line
    }, [formState.data]);

    // --- Form Handlers ---
    const handleInputChange = (field, value) => {
        if (field === 'telefone') {
            setFormState({ ...formState, telefone: maskPhone(value) });
        } else {
            setFormState({ ...formState, [field]: value });
        }
    };
    const handleBlur = (field) => {
        if (isRegistering) {
            setTouchedFieldsRegister({ ...touchedFieldsRegister, [field]: true });
        } else {
            setTouchedFieldsLogin({ ...touchedFieldsLogin, [field]: true });
        }
    };

    // --- Submit/Register/Login ---
    const handleSubmit = () => {
        if (isRegistering) setTriedSubmitRegister(true);
        else setTriedSubmitLogin(true);
        setSubmitting(true);
        setRegistrationError('');

        if (isRegistering) {
            if (!formState.nome || !formState.email || !formState.telefone || !formState.senha || !formState.confirmarSenha) {
                setRegistrationError('Preencha todos os campos obrigatórios.');
                setSubmitting(false);
                return;
            }
            if (formState.senha !== formState.confirmarSenha) {
                setRegistrationError('As senhas não conferem');
                setSubmitting(false);
                return;
            }
            dispatch(registerClient({
                nome: formState.nome,
                email: formState.email,
                telefone: formatPhoneToSend(formState.telefone),
                senha: formState.senha,
                estabelecimentoId: publicData.estabelecimento.id
            }));
        } else {
            if (!formState.email || !formState.senha) {
                setRegistrationError('Preencha email e senha.');
                setSubmitting(false);
                return;
            }
            dispatch(loginClient({
                email: formState.email,
                senha: formState.senha,
                estabelecimentoId: publicData.estabelecimento.id
            }));
        }
    };

    // --- Registration/Verification Steps ---
    useEffect(() => {
        if (isRegistering && clientRegistration) {
            if (clientRegistration.success === true && clientRegistration.step === 2) {
                setStep(5);
                setVerificationStep(2);
                setSubmitting(false);
            } else if (clientRegistration.success === true && clientRegistration.step === 3) {
                setStep(5);
                setVerificationStep(3);
                setSubmitting(false);
            } else if (clientRegistration.success === false && clientRegistration.step === 1) {
                setRegistrationError(clientRegistration.message);
                setTimeout(() => setSubmitting(false), 2000);
            } else if (clientRegistration.success === false && clientRegistration.step === 3) {
                setVerificationStep(1);
                setStep(4);
                setRegistrationError(clientRegistration.message || 'Código inválido, tente novamente.');
                setTimeout(() => setSubmitting(false), 2000);
            }
        }
        // eslint-disable-next-line
    }, [clientRegistration, isRegistering]);

    useEffect(() => {
        if (clientRegistration) {
            if (isRegistering && triedSubmitRegister) {
                if (clientRegistration.success === false && clientRegistration.step === 1) {
                    setRegistrationError(clientRegistration.message);
                    setTimeout(() => setSubmitting(false), 2000);
                }
            }
            if (!isRegistering && triedSubmitLogin) {
                if (clientRegistration.success === false && clientRegistration.step === 1) {
                    setRegistrationError(clientRegistration.message || 'Cliente não encontrado');
                    setTimeout(() => setSubmitting(false), 2000);
                }
            }
        }
        // eslint-disable-next-line
    }, [clientRegistration, isRegistering, triedSubmitRegister, triedSubmitLogin]);

    // --- Appointment Success Step ---
    useEffect(() => {
        if (appointments && appointments.length > 0) {
            const lastAppointment = appointments[appointments.length - 1];
            const selectedService = publicData.servicos.find(s => s.id === formState.servicoId);
            const selectedProfissional =
                type === 'p'
                    ? publicData.profissional
                    : publicData.profissionais.find(p => p.id === formState.profissionalId);
            setAgendamentoData({
                ...lastAppointment,
                _service: selectedService,
                _profissional: selectedProfissional,
            });
            setSubmitting(false);
            setStep(6);
        }
        // eslint-disable-next-line
    }, [appointments]);

    // --- UI Handlers ---
    const handleDateSelect = (date) => {
        if (isSelectingDate) return;
        setIsSelectingDate(true);
        setFormState((prev) => ({
            ...prev,
            data: date,
            horario: '',
        }));
        setTimeout(() => setIsSelectingDate(false), 1500);
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
        // setAgendamentoData(null); // Keep data for success screen until next scheduling
    };

    // --- UI Effects ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            const timeBlockContainer = document.querySelector('.time-block-container');
            if (timeBlockContainer && !timeBlockContainer.contains(event.target)) {
                setFormState((prev) => ({ ...prev, horario: '' }));
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // --- Render Functions ---
    const ServiceSummaryCard = () => {
        const selectedService = publicData.servicos.find(s => s.id === formState.servicoId);
        const selectedDate = moment(formState.data).format('DD/MM/YYYY');
        const selectedTime = formState.horario;
        const selectedProfissional =
            type === 'p'
                ? publicData.profissional?.nome
                : publicData.profissionais.find(p => p.id === formState.profissionalId)?.nome || 'Profissional';
        return (
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 shadow-md mb-4">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide">Data e horário</p>
                        <p className="text-xl font-bold text-violet-700">{selectedDate} às {selectedTime}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide">Valor</p>
                        <p className="text-xl font-bold text-violet-700">R$ {selectedService?.preco.toFixed(2)}</p>
                    </div>
                </div>
                <div>
                    <h2 className="text-lg text-gray-800 font-bold">{selectedService?.titulo || 'Serviço'}</h2>
                    <p className="text-sm mt-1">
                        com <span className="font-semibold">{selectedProfissional}</span>
                    </p>
                </div>
            </div>
        );
    };

    const renderStep5 = () => {
        if (isRegistering && verificationStep === 2) {
            return (
                <div className="p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mt-4">
                        <h3 className="text-lg font-semibold text-violet-700 mb-4">
                            Verificação por SMS
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Digite o código de verificação enviado para {formState.telefone}
                        </p>
                        <input
                            type="text"
                            maxLength="6"
                            className="w-full p-3 text-center text-2xl tracking-wider border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none mb-4"
                            value={smsCode}
                            onChange={(e) => setSmsCode(e.target.value)}
                            placeholder="000000"
                        />
                        <Button
                            className='bg-violet-500 text-white hover:bg-violet-700 transition-all px-4 py-2 duration-200 text-base font-semibold w-full rounded'
                            onClick={() => {
                                if (isVerifyingSms) return;
                                setIsVerifyingSms(true);
                                dispatch(verifyClient({
                                    telefone: formState.telefone,
                                    code: smsCode,
                                    email: formState.email,
                                    nome: formState.nome,
                                    estabelecimentoId: publicData.estabelecimento.id,
                                    senha: formState.senha,
                                }));
                                setTimeout(() => setIsVerifyingSms(false), 2000);
                            }}
                            loading={isVerifyingSms}
                            disabled={isVerifyingSms}
                        >
                            Verificar Código
                        </Button>
                    </div>
                </div>
            );
        }
        if (isRegistering && verificationStep === 3) {
            return (
                <div className="p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-violet-700 mb-4">
                            Confirmar Agendamento
                        </h3>
                        <ServiceSummaryCard />
                        <div className="mt-6">
                            <Button
                                className='bg-violet-500 text-white hover:bg-violet-700 transition-all px-4 py-2 duration-200 text-base font-semibold w-full rounded'
                                onClick={() => {
                                    if (submitting) return;
                                    setSubmitting(true);
                                    const localDateTime = moment(`${moment(formState.data).format('YYYY-MM-DD')}T${formState.horario}`);
                                    const serverDateTime = adjustTimeToServer(localDateTime);
                                    dispatch(createAppointment({
                                        estabelecimentoId: publicData.estabelecimento.id,
                                        servicoId: formState.servicoId,
                                        profissionalId: formState.profissionalId,
                                        data: serverDateTime.toISOString(),
                                        nome: formState.nome,
                                        email: formState.email,
                                        telefone: formState.telefone,
                                    }));
                                }}
                                loading={submitting}
                                disabled={submitting}
                            >
                                Finalizar Agendamento
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="p-4 animate-fade-in">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-violet-700 mb-4">
                        Confirmar Agendamento
                    </h3>
                    <ServiceSummaryCard />
                    <div className="mt-6">
                        <Button
                            className='bg-violet-500 text-white hover:bg-violet-700 transition-all px-4 py-2 duration-200 text-base font-semibold w-full rounded'
                            onClick={() => {
                                if (submitting) return;
                                setSubmitting(true);
                                const localDateTime = moment(`${moment(formState.data).format('YYYY-MM-DD')}T${formState.horario}`);
                                const serverDateTime = adjustTimeToServer(localDateTime);
                                dispatch(createAppointment({
                                    estabelecimentoId: publicData.estabelecimento.id,
                                    servicoId: formState.servicoId,
                                    profissionalId: formState.profissionalId,
                                    data: serverDateTime.toISOString(),
                                    nome: formState.nome,
                                    email: formState.email,
                                    telefone: formState.telefone,
                                }));
                            }}
                            loading={submitting}
                            disabled={submitting}
                        >
                            Confirmar Agendamento
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const renderSuccessStep = () => {
        if (!agendamentoData) return null;
        const selectedService = agendamentoData._service || publicData.servicos.find(s => s.id === agendamentoData.servicoId);
        const selectedProfissional =
            agendamentoData._profissional?.nome ||
            (type === 'p'
                ? publicData.profissional?.nome
                : publicData.profissionais.find(p => p.id === agendamentoData.profissionalId)?.nome) ||
            'Profissional';
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-lg border border-violet-100 max-w-md w-full p-6">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                            <Icon icon="check-circle" className="text-green-500" style={{ fontSize: 40 }} />
                        </div>
                        <h2 className="text-2xl font-bold text-violet-700 mb-1 text-center">Agendamento Confirmado!</h2>
                        <p className="text-gray-600 text-center">Seu agendamento foi realizado com sucesso.</p>
                    </div>
                    <div className="mb-6">
                        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 shadow-md">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide">Data e horário</p>
                                    <p className="text-xl font-bold text-violet-700">
                                        {moment(agendamentoData.data).format('DD/MM/YYYY')} às {moment(agendamentoData.data).format('HH:mm')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold uppercase tracking-wide">Valor</p>
                                    <p className="text-xl font-bold text-violet-700">
                                        R$ {selectedService?.preco?.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg text-gray-800 font-bold">{selectedService?.titulo || 'Serviço'}</h2>
                                <p className="text-sm mt-1">
                                    com <span className="font-semibold">{selectedProfissional}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            appearance="primary"
                            className="bg-violet-500 text-white hover:bg-violet-700 transition-all px-4 py-2 duration-200 text-base font-semibold w-full rounded"
                            onClick={resetForm}
                        >
                            Fazer novo agendamento
                        </Button>
                        <Button
                            appearance="ghost"
                            className="border border-violet-500 text-violet-700 hover:bg-violet-50 transition-all px-4 py-2 duration-200 text-base font-semibold w-full rounded"
                            onClick={() => {
                                setStep(1);
                                setCurrentScreen('reservas');
                            }}
                        >
                            Ver minhas reservas
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

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
                <Icon icon="map-marker" className="text-violet-700" />
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
                    className="flex items-center gap-2 px-4 py-2 bg-violet-700 text-white rounded-full shadow hover:bg-violet-600 transition"
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
                    <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-2">
                        <Icon icon="clock-o" style={{ fontSize: 28 }} className="text-violet-700" />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">Agendar</span>
                </button>
                <button
                    onClick={() => setCurrentScreen('reservas')}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md active:bg-gray-100"
                >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                        <Icon icon="calendar" style={{ fontSize: 25 }} className="text-blue-600" />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">Reservas</span>
                </button>
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
            onChange={handleDateSelect}
            value={formState.data}
            disabledDate={(date) => date <= moment().toDate()}
            disabled={isSelectingDate}
        />
    );

    const renderTimeBlocks = () => {
        if (loading) {
            return (
                <div className="p-4 flex flex-col items-center h-full bg-gray-50 overflow-y-auto animate-pulse">
                    <span className="text-gray-500 mb-2">Carregando horários...</span>
                    <div className="w-6 h-6 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
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
            <div className="time-block-container grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 gap-3 mt-4 text-sm sm:text-base animate-fadeIn">
                {availableHours.map((hour, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setFormState((prev) => ({ ...prev, horario: hour }));
                        }}
                        className={`min-w-0 break-words p-3 rounded-xl text-center border font-semibold transition-all duration-200 ease-in-out shadow-sm 
                            ${formState.horario === hour
                                ? 'bg-violet-500 text-white border-violet-600'
                                : 'bg-white text-gray-800 hover:bg-orange-50 border-gray-200'}
                        `}
                    >
                        {hour}
                    </button>
                ))}
            </div>
        );
    };

    const renderFinalizeButton = () => {
        // Garante que o botão não aparece em qualquer tela que não seja "agendar"
        if (
            currentScreen !== 'agendar' ||
            !formState.horario ||
            step === 4 ||
            step === 5 ||
            step === 6
        ) return null;
    
        return (
            <div className="fixed bottom-16 left-0 right-0 bg-white shadow-lg p-4 border-t border-gray-200 z-20 animate-slide-in-bottom">
                <ServiceSummaryCard />
                <Button
                    className='bg-violet-500 text-white hover:bg-violet-600 transition-all p-2 duration-200 text-base font-semibold'
                    block
                    appearance="primary"
                    onClick={() => {
                        if (submitting) return;
                        setSubmitting(true);
                        setStep(4); // Avança para o passo 4
                        setTimeout(() => setSubmitting(false), 2000);
                    }}
                    disabled={submitting}
                >
                    Finalizar Agendamento
                </Button>
            </div>
        );
    };
    

    const renderUserForm = () => {
        // Escolhe o controle correto
        const touchedFields = isRegistering ? touchedFieldsRegister : touchedFieldsLogin;
        const triedSubmit = isRegistering ? triedSubmitRegister : triedSubmitLogin;

        return (
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <h3 className="text-lg font-semibold text-violet-700 mb-4">
                    {isRegistering ? "Seus dados" : "Login"}
                </h3>
                <div className="space-y-4">
                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome completo <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500 ${touchedFields.nome && !formState.nome ? 'border-red-400' : 'border-gray-300'}`}
                                value={formState.nome}
                                onChange={e => handleInputChange('nome', e.target.value)}
                                onBlur={() => handleBlur('nome')}
                                placeholder="Digite seu nome completo"
                                autoComplete="name"
                            />
                            {touchedFields.nome && !formState.nome && <span className="text-xs text-red-500">Campo obrigatório</span>}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500 ${touchedFields.email && !formState.email ? 'border-red-400' : 'border-gray-300'}`}
                            value={formState.email}
                            onChange={e => handleInputChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')}
                            placeholder="Digite seu email"
                            autoComplete="email"
                        />
                        {touchedFields.email && !formState.email && <span className="text-xs text-red-500">Campo obrigatório</span>}
                    </div>

                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Telefone <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500 ${touchedFields.telefone && (!formState.telefone || formState.telefone.replace(/\D/g, '').length < 10) ? 'border-red-400' : 'border-gray-300'}`}
                                value={formState.telefone}
                                onChange={e => handleInputChange('telefone', e.target.value)}
                                onBlur={() => handleBlur('telefone')}
                                placeholder="(99) 99999-9999"
                                maxLength={16}
                                autoComplete="tel"
                            />
                            {touchedFields.telefone && (!formState.telefone || formState.telefone.replace(/\D/g, '').length < 10) && <span className="text-xs text-red-500">Digite um telefone válido</span>}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha <span className="text-red-500">*</span></label>
                        <input
                            type="password"
                            className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500 ${touchedFields.senha && !formState.senha ? 'border-red-400' : 'border-gray-300'}`}
                            value={formState.senha}
                            onChange={e => handleInputChange('senha', e.target.value)}
                            onBlur={() => handleBlur('senha')}
                            placeholder="Digite sua senha"
                            autoComplete={isRegistering ? "new-password" : "current-password"}
                        />
                        {touchedFields.senha && !formState.senha && <span className="text-xs text-red-500">Campo obrigatório</span>}
                    </div>

                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirmar senha <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500 ${touchedFields.confirmarSenha && (!formState.confirmarSenha || formState.senha !== formState.confirmarSenha) ? 'border-red-400' : 'border-gray-300'}`}
                                value={formState.confirmarSenha}
                                onChange={e => handleInputChange('confirmarSenha', e.target.value)}
                                onBlur={() => handleBlur('confirmarSenha')}
                                placeholder="Confirme sua senha"
                                autoComplete="new-password"
                            />
                            {touchedFields.confirmarSenha && (!formState.confirmarSenha || formState.senha !== formState.confirmarSenha) && <span className="text-xs text-red-500">As senhas não conferem</span>}
                        </div>
                    )}
                </div>
                {/* Só mostra erro se tentou submeter */}
                {registrationError && triedSubmit && (
                    <div className="text-red-500 text-sm mt-2">{registrationError}</div>
                )}
            </div>
        );
    };
    

    return (
        <div className="flex flex-col h-screen bg-gray-50 ">
            {currentScreen !== 'inicio' && (
               <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
               <button
                   onClick={() => {
                       if (step === 5) {
                           setStep(4); // Volta para o passo 3 ao sair do passo 4
                       } else if (step === 4) {
                           setStep(3);
                        } else if (step === 3) {
                           setStep(type === 'p' ? 1 : 2);     // Volta para o passo 1 ou 2 dependendo do tipo
                       } else if (step === 2) {
                           setStep(1); // Volta para o passo 1
                       } else {
                           setCurrentScreen('inicio'); // Volta para a tela inicial
                       }
                   }}
                   className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 focus:outline-none shadow-sm"
                   aria-label="Voltar"
               >
                   <Icon icon="arrow-left" className="text-lg" />
               </button>
           
               <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
                   {currentScreen === 'agendar' ? 'Novo Agendamento' : 'Minhas Reservas'}
               </h1>
           </header>
           


            )}

            <main className="flex-1 overflow-y-auto" >
                {currentScreen === 'inicio' && renderHomeScreen()}
                {currentScreen === 'agendar' && (
                    <div className="p-1" >
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

                              
                            </div>
                        )}

                        {step === 4 && (
                            <div className="p-4 animate-fade-in">
                                {/* Botões Cadastrar/Login */}
                                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6 ">
                                    <Button
                                        className={`px-4 py-2 text-base font-semibold transition-all duration-200 rounded    ${
                                            isRegistering
                                                ? 'bg-violet-700 text-white '
                                                : 'bg-white border border-violet-200 text-violet-700 hover:bg-violet-100'
                                        }`}
                                        onClick={() => {
                                            setIsRegistering(true);
                                            setRegistrationError('');
                                            setTriedSubmitRegister(false);
                                            setTriedSubmitLogin(false);
                                            setTouchedFieldsLogin({});
                                        }}
                                    >
                                        Cadastrar-se
                                    </Button>
                                    <Button
                                        className={`px-4 py-2 text-base font-semibold transition-all duration-200 rounded ${
                                            !isRegistering
                                                ? 'bg-violet-700  text-white'
                                                : 'bg-white border border-violet-200 text-violet-700 hover:bg-violet-100'
                                        }`}
                                        onClick={() => {
                                            setIsRegistering(false);
                                            setRegistrationError('');
                                            setTriedSubmitRegister(false);
                                            setTriedSubmitLogin(false);
                                            setTouchedFieldsRegister({});
                                        }}
                                    >
                                        Fazer Login
                                    </Button>
                                </div>

                                {/* Formulário */}
                                <div className="max-w-xl mx-auto">
                                    {renderUserForm()}
                                </div>

                                {/* Botão de envio */}
                                <div className="mt-6">
                                    <Button
                                        className='bg-violet-500 text-white hover:bg-violet-700 transition-all px-4 py-2 duration-200 text-base font-semibold w-full rounded'
                                        onClick={() => {
                                            if (isRegistering) {
                                                setTouchedFieldsRegister({
                                                    nome: true,
                                                    email: true,
                                                    telefone: true,
                                                    senha: true,
                                                    confirmarSenha: true
                                                });
                                                setTriedSubmitRegister(true);
                                            } else {
                                                setTouchedFieldsLogin({
                                                    email: true,
                                                    senha: true
                                                });
                                                setTriedSubmitLogin(true);
                                            }
                                            if (submitting) return;
                                            handleSubmit();
                                        }}
                                        loading={submitting}
                                        disabled={submitting}
                                    >
                                        {isRegistering ? "Confirmar Cadastro" : "Fazer Login"}
                                    </Button>
                                </div>
                            </div>
                        )}
                        {step === 5 && renderStep5()}
                        {step === 6 && renderSuccessStep()}
                    </div>
                )}
                {currentScreen === 'reservas' && renderReservasScreen()}
            </main>

            {renderFinalizeButton()}

            <nav className="bg-white border-t border-gray-100 flex justify-around px-4 py-2 sticky bottom-0 shadow-sm">
    {[
        { screen: 'inicio', icon: 'home', label: 'Início' },
        { screen: 'agendar', icon: 'clock-o', label: 'Agendar' },
        { screen: 'reservas', icon: 'calendar', label: 'Reservas' }
    ].map(({ screen, icon, label }) => {
        const isActive = currentScreen === screen;
        return (
            <button
                key={screen}
                onClick={() => setCurrentScreen(screen)}
                className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors duration-200 focus:outline-none
                    ${isActive ? 'text-violet-500' : 'text-gray-500 hover:text-violet-400'}
                `}
            >
                <Icon icon={icon} className="text-[22px]" />
                <span className="text-[11px] font-medium mt-0.5">{label}</span>
            </button>
        );
    })}
</nav>

        </div>
    );
};

export default PublicScheduling;