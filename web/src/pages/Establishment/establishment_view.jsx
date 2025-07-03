import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEstablishment,
  updateEstablishment,
  saveEstablishment,
} from "../../store/modules/establishment/establishment_actions";
import { Button, Icon } from "rsuite";
import { WarningModal } from "../../components/Modal/modal_custom";
import InputWithLabel from "../../components/Form/InputWithLabel";

// Máscara visual para telefone: (XX)9XXXX-XXXX
function maskPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)})${digits.slice(2)}`;
  return `(${digits.slice(0, 2)})${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// Formato para enviar ao backend: +55XXXXXXXXXXX
function formatPhoneToSend(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return "";
  return `+55${digits}`;
}

function enderecoToString(endereco) {
  if (!endereco) return "";
  return `${endereco.rua || ""}, ${endereco.numero || ""} - ${
    endereco.bairro || ""
  }, ${endereco.cidade || ""} - ${endereco.estado || ""}, ${
    endereco.cep || ""
  }`;
}

const Establishment = () => {
  const dispatch = useDispatch();
  const {
    data: estabelecimento,
    loading,
    saving,
  } = useSelector((state) => state.establishment);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [telefoneInput, setTelefoneInput] = useState("");
  const [endereco, setEndereco] = useState({
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    complemento: "",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSave, setPendingSave] = useState(null);

  useEffect(() => {
    dispatch(fetchEstablishment());
    // eslint-disable-next-line
  }, []);

  // Atualiza preview se mudar a foto no store
  useEffect(() => {
    if (
      estabelecimento &&
      estabelecimento.foto &&
      !(estabelecimento.foto instanceof File)
    ) {
      setFotoPreview(null);
    }
  }, [estabelecimento.foto]);

  useEffect(() => {
    // Preenche o input com a máscara ao carregar os dados
    if (estabelecimento && estabelecimento.telefone) {
      // Remove +55 se já vier do backend
      const digits = estabelecimento.telefone.replace(/^\+55/, "");
      setTelefoneInput(maskPhone(digits));
    }
  }, [estabelecimento.telefone]);

  useEffect(() => {
    // Preenche os campos de endereço ao carregar os dados
    if (estabelecimento && estabelecimento.endereco) {
      try {
        const enderecoData =
          typeof estabelecimento.endereco === "string"
            ? JSON.parse(estabelecimento.endereco)
            : estabelecimento.endereco;

        setEndereco({
          rua: enderecoData.rua || "",
          numero: enderecoData.numero || "",
          bairro: enderecoData.bairro || "",
          cidade: enderecoData.cidade || "",
          estado: enderecoData.estado || "",
          cep: enderecoData.cep || "",
          complemento: enderecoData.complemento || "",
        });
      } catch (e) {
        console.error("Erro ao carregar endereço:", e);
      }
    }
  }, [estabelecimento.endereco]);

  const handleChange = (key, value) => {
    if (key === "telefone") {
      setTelefoneInput(maskPhone(value));
      // Só armazena os dígitos no redux, sem máscara
      dispatch(
        updateEstablishment({ telefone: value.replace(/\D/g, "").slice(0, 11) })
      );
    } else {
      dispatch(updateEstablishment({ [key]: value }));
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoPreview(URL.createObjectURL(file));
      dispatch(updateEstablishment({ foto: file }));
    }
  };

  const handleEnderecoChange = (key, value) => {
    setEndereco((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const enderecoToSave = {
      ...endereco,
      rua: endereco.rua.trim(),
      numero: endereco.numero.trim(),
      bairro: endereco.bairro.trim(),
      cidade: endereco.cidade.trim(),
      estado: endereco.estado.trim(),
      cep: endereco.cep.trim(),
      complemento: endereco.complemento.trim(),
    };

    // Salva os dados pendentes e mostra o modal de confirmação
    setPendingSave({
      ...estabelecimento,
      telefone: formatPhoneToSend(telefoneInput),
      endereco: JSON.stringify(enderecoToSave),
    });
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    if (pendingSave) {
      dispatch(saveEstablishment(pendingSave));
      setPendingSave(null);
      setShowConfirmModal(false);
    }
  };

  const handleCancelSave = () => {
    setShowConfirmModal(false);
    setPendingSave(null);
  };

  return (
    <div
      className="p-4 max-w-2xl mx-auto"
      style={{ animation: "fadeIn 0.3s ease-in-out" }}
    >
      {/* Modal de confirmação */}
      <WarningModal
        show={showConfirmModal}
        onClose={handleCancelSave}
        title="Confirmar Alterações"
        confirmLabel="Sim, salvar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmSave}
        color="blue"
      >
        Tem certeza que deseja salvar as alterações do perfil do
        estabelecimento?
      </WarningModal>
      {loading ? (
        <div className="text-center py-8">
          <Icon icon="spinner" spin size="2x" />
        </div>
      ) : (
        <form
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          onSubmit={handleSave}
        >
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img
                src={
                  fotoPreview ||
                  (estabelecimento.foto &&
                  !(estabelecimento.foto instanceof File)
                    ? estabelecimento.foto
                    : null) ||
                  "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(estabelecimento.nome || "E") +
                    "&background=0D8ABC&color=fff"
                }
                alt="Foto"
                className="w-28 h-28 rounded-full object-cover border-2 border-gray-200"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer">
                <Icon icon="camera" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFotoChange}
                />
              </label>
            </div>
          </div>
          <InputWithLabel
            label="Nome do Estabelecimento"
            type="text"
            value={estabelecimento.nome}
            onChange={(e) => handleChange("nome", e.target.value)}
            required
          />
          <InputWithLabel
            label="E-mail"
            type="email"
            value={estabelecimento.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
          <InputWithLabel
            label="Telefone"
            type="text"
            value={telefoneInput}
            onChange={(e) => handleChange("telefone", e.target.value)}
            placeholder="(99) 99999-9999"
            maxLength={15}
          />
          <InputWithLabel
            label="Link Personalizado"
            type="text"
            value={estabelecimento.customLink || ""}
            onChange={(e) =>
              handleChange(
                "customLink",
                e.target.value.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase()
              )
            }
            placeholder="meu-estabelecimento"
          />

          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputWithLabel
                  label="Rua"
                  type="text"
                  value={endereco.rua}
                  onChange={(e) => handleEnderecoChange("rua", e.target.value)}
                />
              </div>
              <div>
                <InputWithLabel
                  label="Número"
                  type="text"
                  value={endereco.numero}
                  onChange={(e) =>
                    handleEnderecoChange("numero", e.target.value)
                  }
                />
              </div>
              <div>
                <InputWithLabel
                  label="Bairro"
                  type="text"
                  value={endereco.bairro}
                  onChange={(e) =>
                    handleEnderecoChange("bairro", e.target.value)
                  }
                />
              </div>
              <div>
                <InputWithLabel
                  label="Cidade"
                  type="text"
                  value={endereco.cidade}
                  onChange={(e) =>
                    handleEnderecoChange("cidade", e.target.value)
                  }
                />
              </div>
              <div>
                <InputWithLabel
                  label="Estado"
                  type="text"
                  value={endereco.estado}
                  onChange={(e) =>
                    handleEnderecoChange("estado", e.target.value)
                  }
                />
              </div>
              <div>
                <InputWithLabel
                  label="CEP"
                  type="text"
                  value={endereco.cep}
                  onChange={(e) => handleEnderecoChange("cep", e.target.value)}
                />
              </div>
              <div>
                <InputWithLabel
                  label="Complemento"
                  type="text"
                  value={endereco.complemento}
                  onChange={(e) =>
                    handleEnderecoChange("complemento", e.target.value)
                  }
                />
              </div>
            </div>
            <div>
              <Button
                appearance="ghost"
                color="green"
                onClick={() => {
                  const enderecoCompleto = enderecoToString(endereco);
                  if (enderecoCompleto.replace(/[\s,.-]/g, "") !== "") {
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        enderecoCompleto
                      )}`,
                      "_blank"
                    );
                  } else {
                    window.open("https://www.google.com/maps", "_blank");
                  }
                }}
                disabled={
                  !endereco ||
                  (!endereco.rua && !endereco.cidade && !endereco.estado)
                }
              >
                <Icon icon="map-marker" /> Ver no Google Maps
              </Button>
            </div>
          </div>
          <div className="mt-2">
            {estabelecimento.customLink && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label className="text-sm text-gray-600 block mb-1">
                  URL do seu estabelecimento:
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded text-sm break-all">
                    {`http://localhost:3001/public/e/${estabelecimento.customLink}`}
                  </code>
                  <Button
                    appearance="subtle"
                    size="sm"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `http://localhost:3001/public/e/${estabelecimento.customLink}`
                      )
                    }
                  >
                    <Icon icon="copy" /> Copiar
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="mt-6">
            <Button
              appearance="primary"
              color="blue"
              type="submit"
              loading={saving}
              disabled={saving}
              block
            >
              <Icon icon="save" /> Salvar Alterações
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Establishment;
