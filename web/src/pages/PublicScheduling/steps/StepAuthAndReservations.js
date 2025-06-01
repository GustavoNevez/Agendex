import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon, IconButton } from 'rsuite';
import moment from 'moment';
import Step4RegisterLogin from './Step4RegisterLogin';
import Step5VerificationConfirmation from './Step5VerificationConfirmation';
import AppointmentCard from '../../../components/AppointmentCard';
import CustomModal from '../../../components/Modal';
import CustomDrawer from '../../../components/CustomDrawer';
import {
    registerClient,
    verifyClient,
    loginClient,
    fetchClientAppointments,
    updateClientRegistration,
    deleteClientAppointment
} from '../../../store/modules/public/actions';

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

const StepAuthAndReservations = ({ customLink, publicData }) => {
    const dispatch = useDispatch();
    const { clientRegistration, clientAppointments } = useSelector(state => state.public);

    // Form states
    const [formState, setFormState] = useState({
        nome: '',
        email: '',
        telefone: '',
        senha: '',
        confirmarSenha: ''
    });
    const [registrationError, setRegistrationError] = useState('');
    const [triedSubmitRegister, setTriedSubmitRegister] = useState(false);
    const [triedSubmitLogin, setTriedSubmitLogin] = useState(false);
    const [touchedFieldsRegister, setTouchedFieldsRegister] = useState({});
    const [touchedFieldsLogin, setTouchedFieldsLogin] = useState({});
    const [isRegistering, setIsRegistering] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [smsCode, setSmsCode] = useState('');
    const [isVerifyingSms, setIsVerifyingSms] = useState(false);
    const [verificationStep, setVerificationStep] = useState(1);

    // Modal de detalhes do agendamento
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [canceling, setCanceling] = useState(false);
    const [cancelError, setCancelError] = useState('');

    // Busca agendamentos se logado
    useEffect(() => {
        if (clientRegistration.userToken && customLink) {
            dispatch(fetchClientAppointments({ customLink }));
        }
    }, [clientRegistration.userToken, customLink, dispatch]);

    // Garante que userToken está setado após login/registro bem-sucedido
    useEffect(() => {
        if (
            clientRegistration &&
            clientRegistration.success === true &&
            clientRegistration.step === 3 &&
            !clientRegistration.userToken
        ) {
            // Atualiza o Redux para garantir que userToken está true
            dispatch(updateClientRegistration({ userToken: true }));
        }
    }, [clientRegistration, dispatch]);

    // Controle de steps de verificação
    useEffect(() => {
        if (isRegistering && clientRegistration) {
            if (clientRegistration.success === true && clientRegistration.step === 2) {
                setVerificationStep(2);
                setSubmitting(false);
                setRegistrationError('');
                setTriedSubmitRegister(false);
            } else if (clientRegistration.success === true && clientRegistration.step === 3) {
                setVerificationStep(3);
                setSubmitting(false);
                setRegistrationError('');
                setTriedSubmitRegister(false);
            } else if (clientRegistration.success === false && clientRegistration.step === 1) {
                setRegistrationError(clientRegistration.message);
                setTimeout(() => setSubmitting(false), 700);
            } else if (clientRegistration.success === false && clientRegistration.step === 3) {
                setRegistrationError(clientRegistration.message || 'Código inválido, tente novamente.');
                setTimeout(() => setSubmitting(false), 700);
            }
        }
    }, [clientRegistration, isRegistering]);

    // Handlers
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

    const handleSubmit = async () => {
        if (isRegistering) setTriedSubmitRegister(true);
        else setTriedSubmitLogin(true);
        setSubmitting(true);
        setRegistrationError('');
        try {
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
                await dispatch(registerClient({
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
                await dispatch(loginClient({
                    email: formState.email,
                    senha: formState.senha,
                    estabelecimentoId: publicData.estabelecimento.id
                }));
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerifySms = async () => {
        if (isVerifyingSms) return;
        setIsVerifyingSms(true);
        try {
            await dispatch(verifyClient({
                telefone: formState.telefone,
                code: smsCode,
                email: formState.email,
                nome: formState.nome,
                estabelecimentoId: publicData.estabelecimento.id,
                senha: formState.senha,
            }));
        } finally {
            setIsVerifyingSms(false);
        }
    };

    // Handler para abrir modal
    const handleOpenReservationModal = (reservation) => {
        if (!reservation) return;
        setSelectedReservation(reservation);
        setShowReservationModal(true);
        setCancelError('');
    };

    // Handler para fechar modal
    const handleCloseReservationModal = () => {
        setShowReservationModal(false);
        setSelectedReservation(null);
        setCancelError('');
    };

    // Handler para cancelar agendamento
    const handleCancelReservation = async () => {
        if (!selectedReservation || !selectedReservation.id) return;
        setCanceling(true);
        setCancelError('');
        try {
            await dispatch(deleteClientAppointment({ customLink, id: selectedReservation.id }));
            setShowReservationModal(false);
        } catch (err) {
            setCancelError('Erro ao cancelar agendamento.');
        } finally {
            setCanceling(false);
        }
    };

    // Sempre priorize o estado global de login
    if (clientRegistration && clientRegistration.userToken) {
        // Mostra apenas os agendamentos, sem formulário de login/registro
        return (
            <div className="bg-gray-50 min-h-full p-4 lg:flex lg:justify-center">
                <div className="space-y-6 w-full max-w-2xl">
                    <h2 className="text-2xl font-bold text-violet-700 mb-2 text-left">Meus Agendamentos</h2>
                    {clientAppointments && clientAppointments.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2">
                            {clientAppointments.map((reservation, idx) => (
                                <AppointmentCard
                                    key={reservation.id || idx}
                                    reservation={reservation}
                                    onClick={handleOpenReservationModal}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-lg mx-auto border border-gray-100">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icon icon="calendar" style={{ fontSize: 28 }} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-700">Nenhuma reserva encontrada</h3>
                            <p className="text-gray-500 mb-4">Você ainda não possui agendamentos realizados.</p>
                        </div>
                    )}

                    {/* DRAWER DE DETALHES DO AGENDAMENTO */}
                    {selectedReservation && (
                        <CustomDrawer
                            show={showReservationModal}
                            onClose={handleCloseReservationModal}
                            title="Detalhes do Agendamento"
                            primaryActionLabel="Cancelar Agendamento"
                            primaryActionColor="red"
                            primaryActionDisabled={canceling || (selectedReservation?.status === 'cancelado')}
                            onPrimaryAction={handleCancelReservation}
                            loading={canceling}
                            secondaryActionLabel="Fechar"
                            size="md"
                        >
                            <div className="space-y-6 ">
                                   
                                    <div>
                                        <span className="block text-gray-400 text-sm mb-1">Serviço</span>
                                        <span className="font-semibold text-gray-800 text-lg">
                                            {selectedReservation.servicoNome || selectedReservation.servico || ''}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 text-sm mb-1">Profissional</span>
                                        <span className="font-semibold text-gray-800 text-lg">
                                            {selectedReservation.profissionalNome || selectedReservation.profissional || ''}
                                        </span>
                                    </div>
                                    <div className="flex gap-8">
                                        <div>
                                            <span className="block text-gray-400 text-sm mb-1">Data</span>
                                            <span className="font-semibold text-violet-700 text-lg">
                                                {moment(selectedReservation.data).format('DD/MM/YYYY')}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-400 text-sm mb-1">Horário</span>
                                            <span className="font-semibold text-violet-700 text-lg">
                                                {selectedReservation.horario || moment(selectedReservation.data).format('HH:mm')}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 text-sm mb-1">Valor</span>
                                        <span className="font-semibold text-orange-600 text-xl">
                                            R$ {typeof selectedReservation.valor === 'number'
                                                ? selectedReservation.valor.toFixed(2)
                                                : (typeof selectedReservation.servicoPreco === 'number'
                                                    ? selectedReservation.servicoPreco.toFixed(2)
                                                    : '0,00')}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 text-sm mb-1">Status</span>
                                        <span className={`inline-block font-bold px-3 py-1 rounded-full text-sm
                                            ${selectedReservation.status === 'confirmado'
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : selectedReservation.status === 'pendente'
                                                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                                    : 'bg-gray-50 text-gray-700 border border-gray-200'
                                            }
                                        `}>
                                            {selectedReservation.status
                                                ? selectedReservation.status.charAt(0).toUpperCase() + selectedReservation.status.slice(1)
                                                : 'Confirmado'}
                                        </span>
                                    </div>
                                    {cancelError && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-red-600 text-sm">{cancelError}</p>
                                        </div>
                                    )}
                            </div>
                        </CustomDrawer>
                    )}
                </div>
            </div>
        );
    }

    // Fluxo de verificação SMS
    if (isRegistering && (verificationStep === 2 || verificationStep === 3)) {
        return (
            <Step5VerificationConfirmation
                isRegistering={isRegistering}
                verificationStep={verificationStep}
                smsCode={smsCode}
                setSmsCode={setSmsCode}
                handleVerifySms={handleVerifySms}
                isVerifyingSms={isVerifyingSms}
                submitting={submitting}
                ServiceSummaryCard={() => null}
                handleCreateAppointment={() => {}} // Não faz nada aqui
            />
        );
    }

    // Formulário de login/registro
    const renderUserForm = () => {
        const touchedFields = isRegistering ? touchedFieldsRegister : touchedFieldsLogin;
        const triedSubmit = isRegistering ? triedSubmitRegister : triedSubmitLogin;
        const isSuccess =
            clientRegistration &&
            clientRegistration.success === true &&
            (
                (isRegistering && (clientRegistration.step === 2 || clientRegistration.step === 3)) ||
                (!isRegistering && clientRegistration.step === 3)
            );
        const shouldShowError =
            registrationError &&
            triedSubmit &&
            !submitting &&
            !isSuccess &&
            !(clientRegistration && clientRegistration.success === true);

        return (
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 text-left">
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
                {shouldShowError && (
                    <div className="text-red-500 text-sm mt-2">{registrationError}</div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm mt-10 max-w-lg mx-auto text-left">
            <h3 className="text-lg font-medium mb-2">Faça login para ver seus agendamentos</h3>
            <p className="text-gray-500 mb-4">Entre ou registre-se para visualizar suas reservas.</p>
            <Step4RegisterLogin
                isRegistering={isRegistering}
                setIsRegistering={setIsRegistering}
                registrationError={registrationError}
                setRegistrationError={setRegistrationError}
                triedSubmitRegister={triedSubmitRegister}
                setTriedSubmitRegister={setTriedSubmitRegister}
                triedSubmitLogin={triedSubmitLogin}
                setTriedSubmitLogin={setTriedSubmitLogin}
                touchedFieldsRegister={touchedFieldsRegister}
                setTouchedFieldsRegister={setTouchedFieldsRegister}
                touchedFieldsLogin={touchedFieldsLogin}
                setTouchedFieldsLogin={setTouchedFieldsLogin}
                handleSubmit={handleSubmit}
                submitting={submitting}
                renderUserForm={renderUserForm}
            />
        </div>
    );
};

export default StepAuthAndReservations;
