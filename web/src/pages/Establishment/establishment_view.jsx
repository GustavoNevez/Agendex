import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEstablishment,
  updateEstablishment,
  saveEstablishment,
} from "../../store/modules/establishment/establishment_actions";
import { Button, Icon } from "rsuite";

// Máscara visual para telefone: (XX)9XXXX-XXXX
function maskPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)})${digits.slice(2)}`;
  return `(${digits.slice(0, 2)})${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// Formato para enviar ao backend: +55XXXXXXXXXXX
function formatPhoneToSend(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
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
      setEndereco({
        rua: estabelecimento.endereco.rua || "",
        numero: estabelecimento.endereco.numero || "",
        bairro: estabelecimento.endereco.bairro || "",
        cidade: estabelecimento.endereco.cidade || "",
        estado: estabelecimento.endereco.estado || "",
        cep: estabelecimento.endereco.cep || "",
        complemento: estabelecimento.endereco.complemento || "",
      });
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
    dispatch(
      saveEstablishment({
        ...estabelecimento,
        telefone: formatPhoneToSend(estabelecimento.telefone || telefoneInput),
        endereco: JSON.stringify(endereco),
      })
    );
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
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
          <div className="mb-4">
            <label className="block font-medium mb-1">Nome</label>
            <input
              type="text"
              className="form-control"
              value={estabelecimento.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">E-mail</label>
            <input
              type="email"
              className="form-control"
              value={estabelecimento.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Telefone</label>
            <input
              type="text"
              className="form-control"
              value={telefoneInput}
              onChange={(e) => handleChange("telefone", e.target.value)}
              placeholder="(99) 99999-9999"
              maxLength={15}
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Link Personalizado</label>
            <div className="flex items-center">
              <span className="bg-gray-100 px-2 py-1 rounded-l text-gray-500">
                public/e/
              </span>
              <input
                type="text"
                className="form-control rounded-l-none"
                value={estabelecimento.customLink || ""}
                onChange={(e) =>
                  handleChange(
                    "customLink",
                    e.target.value.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase()
                  )
                }
                placeholder="meu-estabelecimento"
              />
            </div>
            <small className="text-gray-500">
              Use apenas letras, números e hífens.
            </small>
            {estabelecimento.customLink && (
              <div className="mt-2">
                <span className="text-sm text-gray-700">
                  URL:{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {`http://localhost:3001/public/e/${estabelecimento.customLink}`}
                  </code>
                  <Button
                    appearance="subtle"
                    size="xs"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `http://localhost:3001/public/e/${estabelecimento.customLink}`
                      )
                    }
                  >
                    <Icon icon="copy" />
                  </Button>
                </span>
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Endereço</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Rua"
                value={endereco.rua}
                onChange={(e) => handleEnderecoChange("rua", e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Número"
                value={endereco.numero}
                onChange={(e) => handleEnderecoChange("numero", e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Bairro"
                value={endereco.bairro}
                onChange={(e) => handleEnderecoChange("bairro", e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Cidade"
                value={endereco.cidade}
                onChange={(e) => handleEnderecoChange("cidade", e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Estado"
                value={endereco.estado}
                onChange={(e) => handleEnderecoChange("estado", e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                placeholder="CEP"
                value={endereco.cep}
                onChange={(e) => handleEnderecoChange("cep", e.target.value)}
              />
              <input
                type="text"
                className="form-control md:col-span-2"
                placeholder="Complemento"
                value={endereco.complemento}
                onChange={(e) =>
                  handleEnderecoChange("complemento", e.target.value)
                }
              />
            </div>
            <div className="mt-2">
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
