import React, { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Icon } from "rsuite";
import { AuthContext } from "../../context/auth_provider";
import CustomModal from "../../components/Modal/modal_custom";
import { allProfissionais } from "../../store/modules/professional/professional_actions";
import { showSuccessToast, showErrorToast } from "../../utils/notifications";
import api from "../../services/api";

const LinksManagement = () => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const { profissionais } = useSelector((state) => state.profissional) || {
    profissionais: [],
  };

  const [estabelecimento, setEstabelecimento] = useState({
    id: "",
    nome: "",
    customLink: "",
  });
  const [showEstabelecimentoModal, setShowEstabelecimentoModal] =
    useState(false);
  const [showProfissionalModal, setShowProfissionalModal] = useState(false);
  const [selectedProfissional, setSelectedProfissional] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fallback to localStorage if context fails
  const getEstabelecimentoId = () => {
    if (user && user.id) return user.id;

    try {
      const storedUser = localStorage.getItem("@Auth:user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.id;
      }
    } catch (e) {
      console.error("Error getting user from localStorage:", e);
    }
    return null;
  };

  const estabelecimentoId = getEstabelecimentoId();

  useEffect(() => {
    if (estabelecimentoId) {
      dispatch(allProfissionais());
      fetchEstabelecimentoInfo();
    }
  }, [dispatch, estabelecimentoId]);

  const fetchEstabelecimentoInfo = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/estabelecimento/${estabelecimentoId}`);
      if (!data.error) {
        setEstabelecimento({
          id: data.estabelecimento._id || data.estabelecimento.id,
          nome: data.estabelecimento.nome,
          customLink: data.estabelecimento.customLink || "",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar informações do estabelecimento:", error);
      showErrorToast(
        "Não foi possível carregar as informações do estabelecimento"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfissionalModal = (profissional) => {
    setSelectedProfissional(profissional);
    setShowProfissionalModal(true);
  };

  const handleSaveEstabelecimentoLink = async () => {
    try {
      setLoading(true);

      // Obter o token do localStorage
      const token = localStorage.getItem("@Auth:token");
      console.log("Token recuperado:", token ? "Sim" : "Não");

      // Configurar cabeçalho da requisição com o token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      console.log("Tentando salvar com ID:", estabelecimentoId);
      console.log("Link personalizado:", estabelecimento.customLink);

      // Usar a rota correta para atualizar o estabelecimento
      const { data } = await api.put(
        `/estabelecimento/${estabelecimentoId}`,
        { customLink: estabelecimento.customLink },
        config
      );

      console.log("Resposta da API:", data);

      if (!data.error) {
        showSuccessToast(
          "Link personalizado do estabelecimento atualizado com sucesso!"
        );
        setShowEstabelecimentoModal(false);
        fetchEstabelecimentoInfo();
      } else {
        showErrorToast(data.message || "Erro ao atualizar link personalizado");
      }
    } catch (error) {
      console.error("Erro ao salvar link personalizado:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Dados:", error.response.data);

        if (error.response.status === 401) {
          showErrorToast(
            "Erro de autenticação. Por favor, faça login novamente."
          );
        } else {
          showErrorToast(
            `Erro ${error.response.status}: ${
              error.response.data?.message || "Não foi possível salvar o link"
            }`
          );
        }
      } else {
        showErrorToast(
          "Não foi possível salvar o link personalizado: " + error.message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfissionalLink = async () => {
    if (!selectedProfissional) return;

    try {
      setLoading(true);

      // Obter o token do localStorage
      const token = localStorage.getItem("@Auth:token");
      console.log("Token recuperado para profissional:", token ? "Sim" : "Não");

      // Configurar cabeçalho da requisição com o token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      console.log(
        "Tentando salvar profissional com ID:",
        selectedProfissional.id
      );
      console.log(
        "Link personalizado do profissional:",
        selectedProfissional.customLink
      );

      // Usar a rota correta para atualizar o profissional (conforme exemplo do backend)
      const { data } = await api.put(
        `/profissional/${selectedProfissional.id}`,
        { customLink: selectedProfissional.customLink },
        config
      );

      console.log("Resposta da API (profissional):", data);

      if (!data.error) {
        showSuccessToast(
          "Link personalizado do profissional atualizado com sucesso!"
        );
        setShowProfissionalModal(false);
        dispatch(allProfissionais());
      } else {
        showErrorToast(data.message || "Erro ao atualizar link personalizado");
      }
    } catch (error) {
      console.error(
        "Erro ao salvar link personalizado do profissional:",
        error
      );
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Dados:", error.response.data);

        if (error.response.status === 401) {
          showErrorToast(
            "Erro de autenticação. Por favor, faça login novamente."
          );
        } else {
          showErrorToast(
            `Erro ${error.response.status}: ${
              error.response.data?.message || "Não foi possível salvar o link"
            }`
          );
        }
      } else {
        showErrorToast(
          "Não foi possível salvar o link personalizado: " + error.message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() =>
        showSuccessToast("Link copiado para a área de transferência!")
      )
      .catch(() => showErrorToast("Não foi possível copiar o link"));
  };

  // Validador de link personalizado (apenas letras, números e hífens)
  const validateCustomLink = (value) => {
    return value.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
  };

  return (
    <div
      className="p-4 overflow-auto h-100"
      style={{ animation: "fadeIn 0.5s ease-in-out" }}
    >
      <div
        className="grid grid-cols-1 gap-6  mx-auto mb-20"
        style={{ maxWidth: "800px" }}
      >
        <div
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
          style={{ animation: "fadeIn 0.3s ease-in-out" }}
        >
          <div className="  p-4  ">
            <h2 className="font-bold text-gray-800 text-2xl mb-3">
              Gerenciamento de Links Personalizados
            </h2>
            <p className="text-gray-600 mb-5">
              Crie links personalizados para seu estabelecimento e
              profissionais, facilitando o acesso dos seus clientes ao sistema
              de agendamento.
            </p>

            <div className="bg-indigo-50 p-4 rounded-xl mb-6 border border-indigo-100">
              <h3 className="font-semibold text-lg mb-4 text-indigo-800">
                Link do Estabelecimento
              </h3>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  {estabelecimento.customLink ? (
                    <div>
                      <div className="flex items-center flex-wrap bg-white p-2 rounded-lg border border-indigo-100 shadow-sm">
                        <code className="text-sm block overflow-x-auto whitespace-nowrap w-full md:w-auto py-1">
                          {`http://localhost:3001/public/e/${estabelecimento.customLink}`}
                        </code>
                        <button
                          className="ml-auto mt-2 md:mt-0 text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-full transition-all duration-200"
                          onClick={() =>
                            copyToClipboard(
                              `http://localhost:3001/public/e/${estabelecimento.customLink}`
                            )
                          }
                        >
                          <Icon icon="copy" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 bg-white p-4 rounded-lg border border-indigo-100">
                      Você ainda não configurou um link personalizado para seu
                      estabelecimento.
                    </p>
                  )}
                </div>
                <Button
                  appearance="primary"
                  onClick={() => setShowEstabelecimentoModal(true)}
                  className="md:w-auto w-full hover:shadow-lg hover:translate-y-[-2px]"
                  style={{
                    background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
                    boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)",
                    transition: "all 0.3s ease",
                    border: "none",
                    transform: "translateY(0)",
                  }}
                >
                  {estabelecimento.customLink ? "Editar Link" : "Criar Link"}
                </Button>
              </div>
            </div>

            <h3 className="font-bold text-gray-800 text-2xl mb-3">
              Links dos Profissionais
            </h3>

            {/* Mobile and Desktop Card Layout for Professionals */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <Icon
                    icon="spinner"
                    spin
                    size="2x"
                    className="text-indigo-500 mb-3"
                  />
                  <p className="text-gray-600">Carregando profissionais...</p>
                </div>
              ) : profissionais.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <p className="mt-4 text-gray-500 font-medium">
                    Nenhum profissional cadastrado.
                  </p>
                </div>
              ) : (
                profissionais.map((profissional) => (
                  <div
                    key={profissional.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-lg">
                            {profissional.nome
                              ? profissional.nome.charAt(0)
                              : "?"}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-lg text-gray-900">
                              {profissional.nome}
                            </div>
                            <div className="text-sm text-gray-500">
                              {profissional.especialidade}
                            </div>
                          </div>
                        </div>

                        <div className="md:ml-auto flex-1 mt-3 md:mt-0">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-sm font-medium text-gray-500 mb-2">
                              Link Personalizado:
                            </p>
                            {profissional.customLink ? (
                              <div className="flex items-center flex-wrap">
                                <code className="bg-white px-3 py-2 rounded text-sm block w-full overflow-x-auto">
                                  {`http://localhost:3001/public/p/${profissional.customLink}`}
                                </code>
                                <button
                                  className="ml-auto mt-2 text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-full transition-all duration-200"
                                  onClick={() =>
                                    copyToClipboard(
                                      `http://localhost:3001/public/p/${profissional.customLink}`
                                    )
                                  }
                                >
                                  <Icon icon="copy" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 block py-2">
                                Não definido
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 md:mt-0">
                          <Button
                            appearance="primary"
                            size="sm"
                            onClick={() =>
                              handleOpenProfissionalModal({ ...profissional })
                            }
                            style={{
                              background: profissional.customLink
                                ? "linear-gradient(45deg, #3b82f6, #60a5fa)"
                                : "linear-gradient(45deg, #4f46e5, #7c3aed)",
                              boxShadow: "0 2px 5px rgba(79, 70, 229, 0.2)",
                              transition: "all 0.3s ease",
                              border: "none",
                            }}
                            className="hover:shadow-md w-full md:w-auto"
                          >
                            {profissional.customLink
                              ? "Editar Link"
                              : "Criar Link"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para editar link do estabelecimento */}
      <CustomModal
        show={showEstabelecimentoModal}
        onClose={() => setShowEstabelecimentoModal(false)}
        title="Link Personalizado do Estabelecimento"
        size="xs"
        primaryActionLabel="Salvar"
        primaryActionColor="blue"
        primaryActionDisabled={loading || !estabelecimento.customLink}
        onPrimaryAction={handleSaveEstabelecimentoLink}
        secondaryActionLabel="Cancelar"
        loading={loading}
        backdrop={true}
      >
        <div>
          <div className="form-group">
            <label className="block text-gray-700 font-medium mb-2">
              Link Personalizado
            </label>
            <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="bg-gray-100 px-3 py-2 text-gray-500 border-r border-gray-200">
                <span>public/e/</span>
              </div>
              <input
                type="text"
                className="flex-1 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-200"
                placeholder="seu-estabelecimento"
                value={estabelecimento.customLink || ""}
                onChange={(e) =>
                  setEstabelecimento({
                    ...estabelecimento,
                    customLink: validateCustomLink(e.target.value),
                  })
                }
              />
            </div>
            <small className="text-gray-500 mt-2 block">
              Use apenas letras, números e hífens. Este link será usado para
              acessar a página de agendamentos do seu estabelecimento.
            </small>
          </div>

          {estabelecimento.customLink && (
            <div className="mt-5">
              <p className="text-gray-700 font-medium mb-2">
                <b>URL completa:</b>
              </p>
              <div className="bg-indigo-50 p-3 rounded-lg overflow-x-auto border border-indigo-100">
                <code className="text-sm">{`http://localhost:3001/public/e/${estabelecimento.customLink}`}</code>
              </div>
            </div>
          )}
        </div>
      </CustomModal>

      {/* Modal para editar link do profissional */}
      <CustomModal
        show={showProfissionalModal && selectedProfissional !== null}
        onClose={() => setShowProfissionalModal(false)}
        title={`Link Personalizado: ${selectedProfissional?.nome || ""}`}
        size="xs"
        primaryActionLabel="Salvar"
        primaryActionColor="blue"
        primaryActionDisabled={loading || !selectedProfissional?.customLink}
        onPrimaryAction={handleSaveProfissionalLink}
        secondaryActionLabel="Cancelar"
        loading={loading}
        backdrop={true}
      >
        {selectedProfissional && (
          <div>
            <div className="form-group">
              <label className="block text-gray-700 font-medium mb-2">
                Link Personalizado
              </label>
              <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="bg-gray-100 px-3 py-2 text-gray-500 border-r border-gray-200">
                  <span>public/p/</span>
                </div>
                <input
                  type="text"
                  className="flex-1 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-200"
                  placeholder="nome-do-profissional"
                  value={selectedProfissional.customLink || ""}
                  onChange={(e) =>
                    setSelectedProfissional({
                      ...selectedProfissional,
                      customLink: validateCustomLink(e.target.value),
                    })
                  }
                />
              </div>
              <small className="text-gray-500 mt-2 block">
                Use apenas letras, números e hífens. Este link será usado para
                acessar a página de agendamentos deste profissional.
              </small>
            </div>

            {selectedProfissional.customLink && (
              <div className="mt-5">
                <p className="text-gray-700 font-medium mb-2">
                  <b>URL completa:</b>
                </p>
                <div className="bg-indigo-50 p-3 rounded-lg overflow-x-auto border border-indigo-100">
                  <code className="text-sm">{`http://localhost:3001/public/p/${selectedProfissional.customLink}`}</code>
                </div>
              </div>
            )}
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default LinksManagement;
