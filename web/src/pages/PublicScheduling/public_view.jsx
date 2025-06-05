import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Button, Icon } from "rsuite";
import moment from "moment";
import "moment/locale/pt-br";
import "rsuite/dist/styles/rsuite-default.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPublicData,
  checkAvailability,
  createAppointment,
  registerClient,
  verifyClient,
  loginClient,
  updateClientRegistration,
} from "../../store/modules/public/actions";
import CustomDatePicker from "../../components/DataPicker/data_picker";
import Step1ChooseService from "./steps/Step1ChooseService";
import Step2ChooseProfessional from "./steps/Step2ChooseProfessional";
import Step3ChooseDateTime from "./steps/Step3ChooseDateTime";
import Step4RegisterLogin from "./steps/Step4RegisterLogin";
import Step5VerificationConfirmation from "./steps/Step5VerificationConfirmation";
import Step6Success from "./steps/Step6Success";
import StepAuthAndReservations from "./steps/StepAuthAndReservations";
import iconeAgenda3d from "../../assets/icone_agenda_3d.png";
import iconeHorario3d from "../../assets/icone_horario_3d.png";

moment.locale("pt-br");

// Utils
function maskPhone(value) {
  let digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
function formatPhoneToSend(value) {
  let digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 10) return "";
  return `+55 (${digits.slice(0, 2)})${digits.slice(2)}`;
}
const adjustTimeToServer = (localTime) =>
  moment(localTime).subtract(3, "hours");

// Função utilitária para exibir endereço (sem CEP e estado)
function enderecoToString(endereco) {
  if (!endereco || typeof endereco !== "object") return "";
  return `${endereco.rua || ""}, ${endereco.numero || ""} - ${
    endereco.bairro || ""
  }, ${endereco.cidade || ""}`;
}

// Função utilitária para buscar no maps (usa tudo: rua, número, bairro, cidade, estado, cep)
function enderecoCompletoParaMaps(endereco) {
  if (!endereco || typeof endereco !== "object") return "";
  return `${endereco.rua || ""}, ${endereco.numero || ""} - ${
    endereco.bairro || ""
  }, ${endereco.cidade || ""} - ${endereco.estado || ""}, ${
    endereco.cep || ""
  }`;
}

// Main Component
const PublicScheduling = () => {
  // --- Routing and Type ---
  const { customLink } = useParams();
  const location = useLocation();
  const type = location.pathname.includes("/public/e/") ? "e" : "p";

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
    servicoId: "",
    profissionalId: "",
    data: null,
    horario: "",
  });
  const [registrationError, setRegistrationError] = useState("");
  const [verificationStep, setVerificationStep] = useState(1);
  const [isRegistering, setIsRegistering] = useState(true);
  const [availableHours, setAvailableHours] = useState([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [agendamentoData, setAgendamentoData] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("inicio");
  const [smsCode, setSmsCode] = useState("");
  const [isVerifyingSms, setIsVerifyingSms] = useState(false);
  const [isSelectingDate, setIsSelectingDate] = useState(false);
  const [touchedFieldsRegister, setTouchedFieldsRegister] = useState({});
  const [touchedFieldsLogin, setTouchedFieldsLogin] = useState({});
  const [triedSubmitRegister, setTriedSubmitRegister] = useState(false);
  const [triedSubmitLogin, setTriedSubmitLogin] = useState(false);
  const [hasFetchedAvailability, setHasFetchedAvailability] = useState(null);
  const [fotoLoaded, setFotoLoaded] = useState(false);

  // --- Step Control Flag ---
  const allowStep5Ref = useRef(true);

  // --- Redux ---
  const dispatch = useDispatch();
  const {
    publicData,
    availability,
    clientRegistration,
    lastAppointmentCreated,
    appointmentCreationSuccess,
  } = useSelector((state) => state.public);

  // --- Data Fetch ---
  useEffect(() => {
    dispatch(fetchPublicData(customLink, type));
  }, [customLink, type, dispatch]);

  useEffect(() => {
    if (publicData && !publicData.error) setLoading(false);
  }, [publicData]);

  // --- Availability ---
  const fetchAvailableDates = async () => {
    if (!formState.servicoId || (!formState.profissionalId && type === "e"))
      return;
    setAvailableHours([]); // Limpa horários antes de mostrar loading
    setLoading(true);
    setHasFetchedAvailability(false); // Reset flag antes da busca
    try {
      await dispatch(
        checkAvailability({
          estabelecimentoId: publicData.estabelecimento.id,
          servicoId: formState.servicoId,
          profissionalId: formState.profissionalId,
          data: formState.data
            ? moment(formState.data).format("YYYY-MM-DD")
            : moment().format("YYYY-MM-DD"),
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (availability) {
      setLoading(true);
      const timeout = setTimeout(() => {
        setAvailableHours(availability);
        setLoading(false);
        setHasFetchedAvailability(true); // Marca que já buscou pelo menos uma vez
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [availability]);

  useEffect(() => {
    setHasFetchedAvailability(null);
  }, [formState.servicoId, formState.profissionalId, currentScreen]);

  useEffect(() => {
    if (formState.data) fetchAvailableDates();
    // eslint-disable-next-line
  }, [formState.data]);

  // --- Form Handlers ---
  const handleInputChange = (field, value) => {
    if (field === "telefone") {
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
  const handleSubmit = async () => {
    if (isRegistering) setTriedSubmitRegister(true);
    else setTriedSubmitLogin(true);
    setSubmitting(true);
    setRegistrationError("");

    try {
      if (isRegistering) {
        if (
          !formState.nome ||
          !formState.email ||
          !formState.telefone ||
          !formState.senha ||
          !formState.confirmarSenha
        ) {
          setRegistrationError("Preencha todos os campos obrigatórios.");
          setSubmitting(false);
          return;
        }
        if (formState.senha !== formState.confirmarSenha) {
          setRegistrationError("As senhas não conferem");
          setSubmitting(false);
          return;
        }
        await dispatch(
          registerClient({
            nome: formState.nome,
            email: formState.email,
            telefone: formatPhoneToSend(formState.telefone),
            senha: formState.senha,
            estabelecimentoId: publicData.estabelecimento.id,
          })
        );
      } else {
        if (!formState.email || !formState.senha) {
          setRegistrationError("Preencha email e senha.");
          setSubmitting(false);
          return;
        }
        await dispatch(
          loginClient({
            email: formState.email,
            senha: formState.senha,
            estabelecimentoId: publicData.estabelecimento.id,
          })
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- Verificação SMS ---
  const handleVerifySms = async () => {
    if (isVerifyingSms) return;
    setIsVerifyingSms(true);
    try {
      await dispatch(
        verifyClient({
          telefone: formState.telefone,
          code: smsCode,
          email: formState.email,
          nome: formState.nome,
          estabelecimentoId: publicData.estabelecimento.id,
          senha: formState.senha,
        })
      );
    } finally {
      setIsVerifyingSms(false);
    }
  };

  // --- Criação de Agendamento ---
  const handleCreateAppointment = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const localDateTime = moment(
        `${moment(formState.data).format("YYYY-MM-DD")}T${formState.horario}`
      );
      const serverDateTime = adjustTimeToServer(localDateTime);

      // Corrija aqui: NÃO aninhe appointmentData dentro de appointmentData
      await dispatch(
        createAppointment({
          estabelecimentoId: publicData.estabelecimento.id,
          servicoId: formState.servicoId,
          profissionalId: formState.profissionalId,
          data: serverDateTime.toISOString(),
          nome: formState.nome,
          email: formState.email,
          telefone: formState.telefone,
          customLink,
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --- Appointment Success Step ---
  useEffect(() => {
    if (!appointmentCreationSuccess || !lastAppointmentCreated) {
      return;
    }
    const selectedService =
      publicData?.servicos?.find(
        (s) =>
          s.id === lastAppointmentCreated.servicoId ||
          s._id === lastAppointmentCreated.servicoId
      ) ||
      (formState?.servicoId &&
        publicData?.servicos?.find(
          (s) => s.id === formState.servicoId || s._id === formState.servicoId
        ));

    const selectedProfissional =
      type === "p"
        ? publicData?.profissional
        : publicData?.profissionais?.find(
            (p) =>
              p.id === lastAppointmentCreated.profissionalId ||
              p._id === lastAppointmentCreated.profissionalId
          ) ||
          (formState?.profissionalId &&
            publicData?.profissionais?.find(
              (p) =>
                p.id === formState.profissionalId ||
                p._id === formState.profissionalId
            ));

    setAgendamentoData({
      ...lastAppointmentCreated,
      _service: selectedService,
      _profissional: selectedProfissional,
    });
    setSubmitting(false);
    setStep(6);
  }, [appointmentCreationSuccess, lastAppointmentCreated]);

  // --- Registration/Verification Steps ---
  useEffect(() => {
    if (isRegistering && clientRegistration) {
      if (
        clientRegistration.success === true &&
        clientRegistration.step === 2
      ) {
        setStep(5);
        setVerificationStep(2);
        setSubmitting(false);
        setRegistrationError(""); // Limpa erro visual após cadastro bem-sucedido
        setTriedSubmitRegister(false);
      } else if (
        clientRegistration.success === true &&
        clientRegistration.step === 3
      ) {
        setStep(5);
        setVerificationStep(3);
        setSubmitting(false);
        setRegistrationError("");
        setTriedSubmitRegister(false);
      } else if (
        clientRegistration.success === false &&
        clientRegistration.step === 1
      ) {
        setRegistrationError(clientRegistration.message);
        setTimeout(() => setSubmitting(false), 700);
      } else if (
        clientRegistration.success === false &&
        clientRegistration.step === 3
      ) {
        setRegistrationError(
          clientRegistration.message || "Código inválido, tente novamente."
        );
        setTimeout(() => setSubmitting(false), 700);
      }
    }
    // eslint-disable-next-line
  }, [clientRegistration, isRegistering]);

  // Novo efeito: avança para step 5 após login bem-sucedido
  useEffect(() => {
    // Só avança para o step 5 se estiver no fluxo de agendamento
    if (
      currentScreen === "agendar" && // <-- ADICIONADO: só avança se estiver agendando
      !isRegistering &&
      clientRegistration &&
      clientRegistration.success === true &&
      clientRegistration.step === 3 &&
      step !== 5 &&
      step !== 1 &&
      step !== 2 &&
      step !== 3 &&
      allowStep5Ref.current // só permite se não for um "voltar"
    ) {
      setStep(5);
      setVerificationStep(3);
      setSubmitting(false);
      setRegistrationError(""); // Limpa erro visual após login/cadastro bem-sucedido
      setTriedSubmitLogin(false); // Limpa flag de tentativa
      setTriedSubmitRegister(false);
      if (!clientRegistration.userToken) {
        dispatch(updateClientRegistration({ userToken: true }));
      }
    }
    // Após rodar, sempre volta a permitir o fluxo normal
    allowStep5Ref.current = true;
    // eslint-disable-next-line
  }, [clientRegistration, isRegistering, step, currentScreen]); // <-- ADICIONADO currentScreen na lista de dependências

  useEffect(() => {
    if (clientRegistration) {
      if (isRegistering && triedSubmitRegister) {
        if (
          clientRegistration.success === false &&
          clientRegistration.step === 1
        ) {
          setRegistrationError(clientRegistration.message);
          setTimeout(() => setSubmitting(false), 700);
        }
      }
      if (!isRegistering && triedSubmitLogin) {
        if (
          clientRegistration.success === false &&
          clientRegistration.step === 1
        ) {
          setRegistrationError(clientRegistration.message);
          setTimeout(() => setSubmitting(false), 700);
        }
      }
    }
    // eslint-disable-next-line
  }, [
    clientRegistration,
    isRegistering,
    triedSubmitRegister,
    triedSubmitLogin,
  ]);

  useEffect(() => {
    if (agendamentoData) {
      setStep(6);
    }
  }, [agendamentoData]);

  // Limpa agendamento ao iniciar novo agendamento
  const resetForm = () => {
    setFormState({
      nome: "",
      email: "",
      telefone: "",
      senha: "",
      confirmarSenha: "",
      servicoId: "",
      profissionalId: type === "p" ? formState.profissionalId : "",
      data: null,
      horario: "",
    });
    setAvailableHours([]);
    setStep(1);
    setAgendamentoData(null); // <-- MANTENHA aqui, mas só chame quando clicar no botão "Fazer novo agendamento"
  };

  // --- UI Handlers ---
  const handleDateSelect = (date) => {
    if (isSelectingDate) return;
    setIsSelectingDate(true);
    setFormState((prev) => ({
      ...prev,
      data: date,
      horario: "",
    }));
    setTimeout(() => setIsSelectingDate(false), 500);
  };

  // --- UI Effects ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      const timeBlockContainer = document.querySelector(
        ".time-block-container"
      );
      if (timeBlockContainer && !timeBlockContainer.contains(event.target)) {
        setFormState((prev) => ({ ...prev, horario: "" }));
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Adicione este useEffect para resetar o fluxo ao entrar em "Agendar"
  useEffect(() => {
    if (currentScreen === "agendar") {
      setStep(1);
      setFormState({
        nome: "",
        email: "",
        telefone: "",
        senha: "",
        confirmarSenha: "",
        servicoId: "",
        profissionalId: type === "p" ? formState.profissionalId : "",
        data: null,
        horario: "",
      });
      setAvailableHours([]);
      // Remova esta linha:
      // setAgendamentoData(null);
    }
    // eslint-disable-next-line
  }, [currentScreen]);

  // --- Render Functions ---
  const ServiceSummaryCard = () => {
    const selectedService = publicData.servicos.find(
      (s) => s.id === formState.servicoId
    );
    const selectedDate = moment(formState.data).format("DD/MM/YYYY");
    const selectedTime = formState.horario;
    const selectedProfissional =
      type === "p"
        ? publicData.profissional?.nome
        : publicData.profissionais.find(
            (p) => p.id === formState.profissionalId
          )?.nome || "Profissional";
    return (
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 shadow-md mb-4 w-full max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide">
              Data e horário
            </p>
            <p className="text-xl font-bold text-violet-700">
              {selectedDate} às {selectedTime}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg text-gray-800 font-bold">
              {selectedService?.titulo || "Serviço"}
            </h2>
            <p className="text-sm mt-1">
              com{" "}
              <span className="font-semibold text-gray-800">
                {selectedProfissional}
              </span>
            </p>
          </div>
          <div className="text-right mt-4">
            <p className="text-xl font-bold text-violet-700">
              R$ {selectedService?.preco.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderHomeScreen = () => (
    <div className="p-4 flex flex-col items-center h-full bg-gray-50 overflow-y-auto lg:justify-center lg:min-h-[80vh]">
      {/* Imagem de perfil dinâmica */}
      <div className="mt-6 mb-4 relative w-32 h-32 flex items-center justify-center">
        {!fotoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          src={publicData.estabelecimento?.foto}
          alt="Perfil"
          className={`w-32 h-32 rounded-full object-cover border-4 border-white shadow-md transition-opacity duration-300 ${
            fotoLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setFotoLoaded(true)}
          onError={() => setFotoLoaded(true)}
          style={{ background: "#f3f3f3" }}
        />
      </div>
      {/* Nome */}
      <h1 className="text-xl font-bold text-center text-gray-800 mb-1">
        {publicData.estabelecimento?.nome}
      </h1>
      {/* Localização */}
      <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-4 sm:text-base mb-4 text-center flex-wrap">
        <span>{enderecoToString(publicData.estabelecimento?.endereco)}</span>
      </div>
      {/* Botões: WhatsApp + Maps */}
      <div className="flex gap-4 mb-4">
        <a
          href={`https://wa.me/${(
            publicData.estabelecimento?.telefone || ""
          ).replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full shadow hover:bg-green-600 transition"
          style={{ textDecoration: "none", outline: "none", boxShadow: "none" }}
        >
          <Icon icon="whatsapp" />
          WhatsApp
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            enderecoCompletoParaMaps(publicData.estabelecimento?.endereco)
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-violet-700 text-white rounded-full shadow hover:bg-violet-600 transition"
          style={{ textDecoration: "none", outline: "none", boxShadow: "none" }}
        >
          <Icon icon="map" />
          Ver no Mapa
        </a>
      </div>
      {/* Botões centrais: Agendar / Reservas */}
      <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-md lg:max-w-2xl">
        <button
          onClick={() => setCurrentScreen("agendar")}
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md active:bg-gray-100"
        >
          {/* Ícone 3D agenda */}
          <img
            src={iconeHorario3d}
            alt="Agendar"
            className="w-16 h-16 mb-2"
            draggable={false}
          />
          <span className="font-bold text-gray-800 text-lg">Agendar</span>
        </button>
        <button
          onClick={() => setCurrentScreen("reservas")}
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md active:bg-gray-100"
        >
          {/* Ícone 3D reservas */}
          <img
            src={iconeAgenda3d}
            alt="Reservas"
            className="w-16 h-16 mb-2"
            draggable={false}
          />
          <span className="font-bold text-gray-800 text-lg">Reservas</span>
        </button>
      </div>
    </div>
  );
  const renderReservasScreen = () => (
    <StepAuthAndReservations customLink={customLink} publicData={publicData} />
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

    // Só mostra mensagem se não estiver carregando, já buscou (true) e não há horários
    if (
      !loading &&
      hasFetchedAvailability === true &&
      availableHours.length === 0
    ) {
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
                            ${
                              formState.horario === hour
                                ? "bg-violet-500 text-white border-violet-600"
                                : "bg-white text-gray-800 hover:bg-orange-50 border-gray-200"
                            }
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
      currentScreen !== "agendar" ||
      !formState.horario ||
      step === 2 ||
      step === 1 ||
      step === 4 ||
      step === 5 ||
      step === 6
    )
      return null;

    return (
      <div className="fixed bottom-16 left-0 right-0 bg-white shadow-lg p-4 border-t border-gray-200 z-20 animate-slide-in-bottom">
        <div className="max-w-screen-md mx-auto w-full space-y-4">
          <div className="w-full">
            <ServiceSummaryCard />
          </div>
          <Button
            className="bg-violet-500 text-white hover:bg-violet-600 transition-all duration-200 text-base font-semibold w-full"
            appearance="primary"
            onClick={() => {
              if (submitting) return;
              setSubmitting(true);
              // Se já está logado, vá direto para step 5 (confirmação)
              if (clientRegistration && clientRegistration.userToken === true) {
                setStep(5);
                setVerificationStep(3);
              } else {
                setStep(4);
              }
              setTimeout(() => setSubmitting(false), 700);
            }}
            disabled={submitting}
          >
            Finalizar Agendamento
          </Button>
        </div>
      </div>
    );
  };

  const renderUserForm = () => {
    // Escolhe o controle correto
    const touchedFields = isRegistering
      ? touchedFieldsRegister
      : touchedFieldsLogin;
    const triedSubmit = isRegistering ? triedSubmitRegister : triedSubmitLogin;
    // Novo: verifica se login/cadastro foi bem-sucedido
    const isSuccess =
      clientRegistration &&
      clientRegistration.success === true &&
      ((isRegistering &&
        (clientRegistration.step === 2 || clientRegistration.step === 3)) ||
        (!isRegistering && clientRegistration.step === 3));

    // NOVO: NUNCA mostra erro se está indo para o próximo passo (step >= 5)
    // E nunca mostra erro se o clientRegistration.success for true (login/cadastro OK)
    const shouldShowError =
      registrationError &&
      triedSubmit &&
      !submitting &&
      !isSuccess &&
      step < 5 &&
      !(clientRegistration && clientRegistration.success === true);

    return (
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <h3 className="text-lg font-semibold text-violet-700 mb-4">
          {isRegistering ? "Seus dados" : "Login"}
        </h3>
        <div className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  touchedFields.nome && !formState.nome
                    ? "border-red-400"
                    : "border-gray-300"
                }`}
                value={formState.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                onBlur={() => handleBlur("nome")}
                placeholder="Digite seu nome completo"
                autoComplete="name"
              />
              {touchedFields.nome && !formState.nome && (
                <span className="text-xs text-red-500">Campo obrigatório</span>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                touchedFields.email && !formState.email
                  ? "border-red-400"
                  : "border-gray-300"
              }`}
              value={formState.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="Digite seu email"
              autoComplete="email"
            />
            {touchedFields.email && !formState.email && (
              <span className="text-xs text-red-500">Campo obrigatório</span>
            )}
          </div>

          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Telefone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  touchedFields.telefone &&
                  (!formState.telefone ||
                    formState.telefone.replace(/\D/g, "").length < 10)
                    ? "border-red-400"
                    : "border-gray-300"
                }`}
                value={formState.telefone}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
                onBlur={() => handleBlur("telefone")}
                placeholder="(99) 99999-9999"
                maxLength={16}
                autoComplete="tel"
              />
              {touchedFields.telefone &&
                (!formState.telefone ||
                  formState.telefone.replace(/\D/g, "").length < 10) && (
                  <span className="text-xs text-red-500">
                    Digite um telefone válido
                  </span>
                )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                touchedFields.senha && !formState.senha
                  ? "border-red-400"
                  : "border-gray-300"
              }`}
              value={formState.senha}
              onChange={(e) => handleInputChange("senha", e.target.value)}
              onBlur={() => handleBlur("senha")}
              placeholder="Digite sua senha"
              autoComplete={isRegistering ? "new-password" : "current-password"}
            />
            {touchedFields.senha && !formState.senha && (
              <span className="text-xs text-red-500">Campo obrigatório</span>
            )}
          </div>

          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirmar senha <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  touchedFields.confirmarSenha &&
                  (!formState.confirmarSenha ||
                    formState.senha !== formState.confirmarSenha)
                    ? "border-red-400"
                    : "border-gray-300"
                }`}
                value={formState.confirmarSenha}
                onChange={(e) =>
                  handleInputChange("confirmarSenha", e.target.value)
                }
                onBlur={() => handleBlur("confirmarSenha")}
                placeholder="Confirme sua senha"
                autoComplete="new-password"
              />
              {touchedFields.confirmarSenha &&
                (!formState.confirmarSenha ||
                  formState.senha !== formState.confirmarSenha) && (
                  <span className="text-xs text-red-500">
                    As senhas não conferem
                  </span>
                )}
            </div>
          )}
        </div>
        {/* Só mostra erro se tentou submeter, NÃO teve sucesso e NÃO está carregando */}
        {shouldShowError && (
          <div className="text-red-500 text-sm mt-2">{registrationError}</div>
        )}
      </div>
    );
  };

  // Novo: tela de login/registro para reservas

  //FLUXO INICIAL

  return (
    <div className="flex flex-col h-screen bg-gray-50 ">
      {currentScreen !== "inicio" && (
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3 max-w-screen-xl mx-auto lg:pl-60">
            <button
              onClick={() => {
                // Corrige o fluxo do botão voltar na etapa 5 após login

                if (step === 5) {
                  allowStep5Ref.current = false; // previne o efeito de forçar step 5
                  setStep(3);
                } else if (step === 4) {
                  setStep(3);
                } else if (step === 3) {
                  setStep(type === "p" ? 1 : 2);
                } else if (step === 2) {
                  setStep(1);
                } else {
                  setCurrentScreen("inicio");
                }
              }}
              className="w-10 h-10 flex items-center justify-center p-0 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 focus:outline-none shadow-sm"
              aria-label="Voltar"
            >
              <Icon icon="chevron-left" style={{ fontSize: 20 }} />
            </button>
            {/* ...existing code... */}
          </div>
        </header>
      )}

      <main className="flex-1 overflow-y-auto flex justify-center">
        <div className="w-full max-w-2xl xl:max-w-3xl">
          {currentScreen === "inicio" && renderHomeScreen()}
          {currentScreen === "agendar" && (
            <div className="p-1 lg:p-8">
              {step === 1 && (
                <Step1ChooseService
                  publicData={publicData}
                  formState={formState}
                  setFormState={setFormState}
                  setStep={setStep}
                  type={type}
                />
              )}
              {step === 2 && (
                <Step2ChooseProfessional
                  publicData={publicData}
                  formState={formState}
                  setFormState={setFormState}
                  setStep={setStep}
                  fetchAvailableDates={fetchAvailableDates}
                />
              )}
              {step === 3 && (
                <Step3ChooseDateTime
                  publicData={publicData}
                  formState={formState}
                  setFormState={setFormState}
                  availableHours={availableHours}
                  setAvailableHours={setAvailableHours}
                  loading={loading}
                  setLoading={setLoading}
                  hasFetchedAvailability={hasFetchedAvailability}
                  setHasFetchedAvailability={setHasFetchedAvailability}
                  renderDatePicker={renderDatePicker}
                  renderTimeBlocks={renderTimeBlocks}
                  renderUserForm={renderUserForm}
                  ServiceSummaryCard={ServiceSummaryCard}
                />
              )}
              {step === 4 && (
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
              )}
              {step === 5 && (
                <Step5VerificationConfirmation
                  isRegistering={isRegistering}
                  verificationStep={verificationStep}
                  smsCode={smsCode}
                  setSmsCode={setSmsCode}
                  handleVerifySms={handleVerifySms}
                  isVerifyingSms={isVerifyingSms}
                  handleCreateAppointment={handleCreateAppointment}
                  submitting={submitting}
                  ServiceSummaryCard={ServiceSummaryCard}
                />
              )}
              {step === 6 && (
                <Step6Success
                  agendamentoData={agendamentoData}
                  publicData={publicData}
                  type={type}
                  resetForm={() => {
                    // Só limpe agendamentoData aqui!
                    setAgendamentoData(null);
                    resetForm();
                  }}
                  setStep={setStep}
                  setCurrentScreen={setCurrentScreen}
                />
              )}
            </div>
          )}
          {currentScreen === "reservas" && renderReservasScreen()}
        </div>
      </main>

      {renderFinalizeButton()}

      <nav className="bg-white border-t border-gray-100 flex justify-around px-4 py-2 sticky bottom-0 shadow-sm lg:justify-center lg:gap-24">
        {[
          { screen: "inicio", icon: "home", label: "Início" },
          { screen: "agendar", icon: "clock-o", label: "Agendar" },
          { screen: "reservas", icon: "calendar", label: "Reservas" },
        ].map(({ screen, icon, label }) => {
          const isActive = currentScreen === screen;
          return (
            <button
              key={screen}
              onClick={() => setCurrentScreen(screen)}
              className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors duration-200 focus:outline-none
                    ${
                      isActive
                        ? "text-violet-500"
                        : "text-gray-500 hover:text-violet-400"
                    }
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
