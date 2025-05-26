import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'rsuite';
import moment from 'moment';
import Step4RegisterLogin from './Step4RegisterLogin';
import Step5VerificationConfirmation from './Step5VerificationConfirmation';
import {
    registerClient,
    verifyClient,
    loginClient,
    fetchClientAppointments,
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

    // Busca agendamentos se logado
    useEffect(() => {
        if (clientRegistration.userToken && customLink) {
            dispatch(fetchClientAppointments({ customLink }));
        }
    }, [clientRegistration.userToken, customLink, dispatch]);

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

    // Só renderiza o formulário se NÃO estiver logado
    if (clientRegistration.userToken) {
        // Mostra apenas os agendamentos, sem formulário de login/registro
        return (
            <div className="bg-gray-50 min-h-full p-4 lg:flex lg:justify-center">
                <div className="space-y-4 w-full max-w-2xl">
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
                                            R$ {typeof reservation.valor === 'number' ? reservation.valor.toFixed(2) : '0,00'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-6 rounded-xl shadow-sm text-center max-w-lg mx-auto">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icon icon="calendar" style={{ fontSize: 24 }} className="text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">Nenhuma reserva encontrada</h3>
                            <p className="text-gray-500 mb-4">Você ainda não possui agendamentos realizados.</p>
                        </div>
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
                {shouldShowError && (
                    <div className="text-red-500 text-sm mt-2">{registrationError}</div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm text-center mt-10 max-w-lg mx-auto">
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
