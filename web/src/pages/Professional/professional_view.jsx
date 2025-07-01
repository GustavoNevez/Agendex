import { Button, Icon, Tag } from "rsuite";
import TableHeaderCustom from "../../components/TableHeaderCustom/table_header_custom";
import InputMask from "react-input-mask";
import CustomModal from "../../components/Modal/modal_custom";
import CustomDrawer from "../../components/Drawer/drawer_custom";
import CustomTable from "../../components/Table/table_custom";
import "rsuite/dist/styles/rsuite-default.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { allServicos } from "../../store/modules/service/service_actions";
import {
  allProfissionais,
  updateProfissional,
  addProfissional,
  resetProfissional,
  removeProfissional,
  saveProfissional,
  uploadFotoProfissional,
} from "../../store/modules/professional/professional_actions";
import { showSuccessToast, showErrorToast } from "../../utils/notifications";
import useMediaQuery from "../../hooks/useMediaQuery";
import CustomButton from "../../components/Button/button_custom";
import api from "../../services/api";

const Profissionais = () => {
  const dispatch = useDispatch();
  const {
    profissionais,
    profissional,
    estadoFormulario,
    componentes,
    comportamento,
    filters,
    pagination,
  } = useSelector((state) => state.profissional) || {};
  const { servicos } = useSelector((state) => state.servico) || {
    servicos: [],
  };
  const [selectedServices, setSelectedServices] = useState([]);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const selecionarComponente = (componente, state) => {
    dispatch(
      updateProfissional({
        componentes: { ...componentes, [componente]: state },
      })
    );
  };

  const selecionarProfissional = (key, value) => {
    dispatch(
      updateProfissional({
        profissional: { ...profissional, [key]: value },
      })
    );
  };

  const onRowClick = (profissional) => {
    // Ensure we handle the photo URL correctly
    const profissionalWithPhoto = {
      ...profissional,
      foto: profissional.foto || null,
      fotoPreview: null,
    };

    // If foto is a relative path, prefix it with API URL
    if (
      profissionalWithPhoto.foto &&
      !profissionalWithPhoto.foto.startsWith("http")
    ) {
      profissionalWithPhoto.foto = `${api.defaults.baseURL}/files/${profissionalWithPhoto.foto}`;
    }

    dispatch(
      updateProfissional({
        profissional: profissionalWithPhoto,
        comportamento: "update",
      })
    );
    setSelectedServices(profissional.servicosId || []);
    selecionarComponente("drawer", true);
  };

  const save = () => {
    // Make sure all required fields are included
    const updatedData = {
      ...profissional,
      servicosId: selectedServices,
      status: profissional.status || "A",
      email: profissional.email?.trim(),
      nome: profissional.nome?.trim(),
    };

    // Update professional data in state before dispatching action
    dispatch(
      updateProfissional({
        profissional: updatedData,
      })
    );

    if (comportamento === "create") {
      dispatch(addProfissional());
    } else {
      selecionarComponente("confirmUpdate", true);
    }
  };

  const confirmSave = () => {
    dispatch(saveProfissional());
    selecionarComponente("confirmUpdate", false);
  };

  const remove = () => {
    dispatch(removeProfissional());
    showSuccessToast("Profissional removido com sucesso!");
  };

  useEffect(() => {
    dispatch(allProfissionais());
    dispatch(allServicos());
  }, [dispatch]);

  useEffect(() => {
    if (profissional && profissional.servicosId) {
      setSelectedServices(profissional.servicosId);
    } else {
      setSelectedServices([]);
    }
  }, [profissional]);

  const toggleService = (serviceId) => {
    setSelectedServices((prevSelected) => {
      if (prevSelected.includes(serviceId)) {
        return prevSelected.filter((id) => id !== serviceId);
      } else {
        return [...prevSelected, serviceId];
      }
    });
  };

  const handleSearchChange = (value) => {
    dispatch(
      updateProfissional({
        filters: { ...filters, search: value, page: 1 }, // Reset to first page on search
      })
    );
    dispatch(allProfissionais());
  };

  const handleSortColumn = (sortColumn, sortType) => {
    dispatch(
      updateProfissional({
        filters: { ...filters, sortColumn, sortType },
      })
    );
    dispatch(allProfissionais());
  };

  const handleChangePage = (nextPage) => {
    dispatch(
      updateProfissional({
        filters: { ...filters, page: nextPage },
      })
    );
    dispatch(allProfissionais());
  };

  const handleChangeLimit = (limit) => {
    dispatch(
      updateProfissional({
        filters: { ...filters, limit, page: 1 },
      })
    );
    dispatch(allProfissionais());
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        showErrorToast(
          "Tipo de arquivo inválido. Use apenas JPG, JPEG ou PNG."
        );
        return;
      }

      const previewUrl = URL.createObjectURL(file);

      dispatch(
        updateProfissional({
          profissional: {
            ...profissional,
            foto: file,
            fotoPreview: previewUrl,
          },
        })
      );

      // Remove this dispatch as we'll handle photo updates in saveProfissional
      // if (profissional.id) {
      //   dispatch(uploadFotoProfissional(profissional.id, file));
      // }
    }
  };

  const columns = [
    {
      key: "nome",
      label: isMobile ? "Profissionais" : "Nome",
      width: 250,
      render: (value, rowData) => (
        <div className="flex items-center">
          <div className="h-8 w-8 min-w-[2rem] rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
            {value ? value.charAt(0) : "?"}
          </div>
          <div className="ml-4 truncate">
            <div className="font-medium text-gray-900">{value}</div>
            {!isMobile && (
              <div className="text-sm text-gray-500">
                {rowData.especialidade}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "E-mail",
      width: 200,
      hideOnMobile: true,
    },
    {
      key: "telefone",
      label: "Telefone",
      width: 150,
      hideOnMobile: true,
    },
    {
      key: "status",
      label: "Status",
      width: 100,
      hideOnMobile: true,
      render: (value) => (
        <Tag color={value === "A" ? "green" : "red"}>
          {value === "A" ? "Ativo" : "Inativo"}
        </Tag>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      width: 120,
      fixed: "right",
      render: (_, rowData) => (
        <CustomButton
          label={isMobile ? "Ver detalhes" : "Ver informações"}
          appearance="primary"
          gradient="primary"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            onRowClick(rowData);
          }}
        />
      ),
    },
  ];

  return (
    <div
      className="col p-4 overflow-auto h-100"
      style={{ animation: "fadeIn 0.3s ease-in-out" }}
    >
      {/* Professional Drawer */}
      <CustomDrawer
        show={componentes.drawer}
        onClose={() => {
          selecionarComponente("drawer", false);
          dispatch(resetProfissional());
          setSelectedServices([]);
        }}
        title={
          comportamento === "create"
            ? "Cadastrar profissional"
            : "Atualizar profissional"
        }
        size="md"
        primaryActionLabel="Salvar Profissional"
        primaryActionIcon="save"
        primaryActionColor="green"
        onPrimaryAction={save}
        primaryActionDisabled={
          !profissional.nome ||
          !profissional.email ||
          !profissional.telefone ||
          !profissional.especialidade ||
          selectedServices.length === 0 ||
          estadoFormulario.saving
        }
        secondaryActionLabel={
          comportamento === "update" ? "Remover Profissional" : undefined
        }
        secondaryActionColor="red"
        onSecondaryAction={
          comportamento === "update"
            ? () => selecionarComponente("confirmDelete", true)
            : undefined
        }
        loading={estadoFormulario.saving || estadoFormulario.loadingFoto}
      >
        <div className="row mt-2">
          <div className="form-group col-12 mb-3 text-center">
            <div className="position-relative d-inline-block">
              <div
                className="rounded-circle overflow-hidden"
                style={{
                  width: "120px",
                  height: "120px",
                  border: "2px solid #ddd",
                }}
              >
                {estadoFormulario.loadingFoto ? (
                  <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                    <Icon icon="spinner" pulse />
                  </div>
                ) : profissional?.fotoPreview || profissional?.foto ? (
                  <img
                    src={profissional.fotoPreview || profissional.foto}
                    alt="Foto do profissional"
                    className="w-100 h-100 object-fit-cover"
                  />
                ) : (
                  <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                    <Icon
                      icon="user"
                      style={{ fontSize: "3em", color: "#999" }}
                    />
                  </div>
                )}
              </div>
              <label
                className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2"
                style={{ cursor: "pointer" }}
              >
                <Icon icon="camera" />
                <input
                  type="file"
                  className="d-none"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <div className="form-group col-md-6 col-sm-12 mb-3">
            <b className="">Nome completo *</b>
            <input
              type="text"
              className="form-control"
              placeholder="Digite o nome do profissional"
              value={profissional.nome || ""}
              onChange={(e) => selecionarProfissional("nome", e.target.value)}
            />
          </div>

          <div className="form-group col-md-6 col-sm-12 mb-3">
            <b className="">Especialidade *</b>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Cabeleireiro, Barbeiro, etc"
              value={profissional.especialidade || ""}
              onChange={(e) =>
                selecionarProfissional("especialidade", e.target.value)
              }
            />
          </div>

          <div className="form-group col-md-6 col-sm-12 mb-3">
            <b className="">E-mail *</b>
            <input
              type="email"
              className="form-control"
              placeholder="email@exemplo.com"
              value={profissional.email || ""}
              onChange={(e) => selecionarProfissional("email", e.target.value)}
            />
          </div>

          <div className="form-group col-md-6 col-sm-12 mb-3">
            <b className="">Telefone *</b>
            <InputMask
              mask="(99) 99999-9999"
              className="form-control"
              placeholder="(42) 99999-9999"
              value={profissional.telefone || ""}
              onChange={(e) =>
                selecionarProfissional("telefone", e.target.value)
              }
            />
          </div>

          <div className="form-group col-md-6 col-sm-12 mb-3">
            <b className="">Status</b>
            <select
              className="form-control"
              value={profissional.status || "A"}
              onChange={(e) => selecionarProfissional("status", e.target.value)}
            >
              <option value="A">Ativo</option>
              <option value="I">Inativo</option>
            </select>
          </div>

          <div className="form-group col-12 mb-3">
            <b className="">Serviços oferecidos *</b>
            <div
              className="border rounded p-3"
              style={{ maxHeight: "250px", overflowY: "auto" }}
            >
              {servicos.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <Icon icon="info-circle" style={{ fontSize: "24px" }} />
                  <p className="mt-2">Nenhum serviço cadastrado</p>
                </div>
              ) : (
                <div className="row g-3">
                  {servicos.map((servico) => (
                    <div key={servico.id} className="col-md-6">
                      <div
                        className={`service-card p-3 rounded-3 ${
                          selectedServices.includes(servico.id)
                            ? "bg-primary text-white shadow-sm"
                            : "border"
                        }`}
                        onClick={() => toggleService(servico.id)}
                        style={{ cursor: "pointer", transition: "all 0.2s" }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <div className="form-check mb-0">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedServices.includes(servico.id)}
                              readOnly
                            />
                          </div>
                          <div>
                            <div className="fw-bold">{servico.titulo}</div>
                            <small>
                              R$ {parseFloat(servico.preco).toFixed(2)}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group col-12 mb-3">
            <b className="">Link Personalizado</b>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="seu-link-personalizado"
                value={profissional.customLink || ""}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z0-9-]/g, "-")
                    .toLowerCase();
                  selecionarProfissional("customLink", value);
                }}
              />
              {profissional.customLink && (
                <Button
                  appearance="default"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `http://localhost:3000/public/p/${profissional.customLink}`
                    );
                    showSuccessToast("Link copiado!");
                  }}
                >
                  <Icon icon="copy" />
                </Button>
              )}
            </div>
            <small className="text-muted mt-1 d-block">
              <Icon icon="info-circle" /> Este link permitirá que clientes
              acessem diretamente o perfil
            </small>
          </div>
        </div>
      </CustomDrawer>

      {/* Confirmation Modals using CustomModal */}
      <CustomModal
        show={componentes.confirmDelete}
        onClose={() => selecionarComponente("confirmDelete", false)}
        title="Confirmar Exclusão"
        size="xs"
        primaryActionLabel="Sim, excluir"
        primaryActionColor="red"
        primaryActionDisabled={estadoFormulario.saving}
        onPrimaryAction={remove}
        secondaryActionLabel="Cancelar"
        loading={estadoFormulario.saving}
      >
        <div className="text-center">
          <Icon icon="remind" style={{ color: "#ffb300", fontSize: 24 }} />
          <p className="mt-3">
            Tem certeza que deseja excluir este profissional?
          </p>
          <p className="text-danger">Esta ação não pode ser desfeita.</p>
        </div>
      </CustomModal>

      <CustomModal
        show={componentes.confirmUpdate}
        onClose={() => selecionarComponente("confirmUpdate", false)}
        title="Confirmar Atualização"
        size="xs"
        primaryActionLabel="Sim, atualizar"
        primaryActionColor="green"
        primaryActionDisabled={estadoFormulario.saving}
        onPrimaryAction={confirmSave}
        secondaryActionLabel="Cancelar"
        loading={estadoFormulario.saving}
      >
        <div className="text-center">
          <Icon icon="remind" style={{ color: "#ffb300", fontSize: 24 }} />
          <p className="mt-3">
            Tem certeza que deseja atualizar este profissional?
          </p>
        </div>
      </CustomModal>

      <div className="row">
        <div className="col-12">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-5 border border-gray-200">
            <TableHeaderCustom
              title="Profissionais"
              searchPlaceholder="Buscar por nome ou email..."
              searchKeyword={filters.search}
              onSearchChange={handleSearchChange}
              buttonLabel="Adicionar profissional"
              buttonIcon="plus"
              isMobile={isMobile}
              onButtonClick={() => {
                dispatch(
                  updateProfissional({
                    comportamento: "create",
                  })
                );
                dispatch(resetProfissional());
                setSelectedServices([]);
                selecionarComponente("drawer", true);
              }}
            />
            <CustomTable
              data={profissionais}
              columns={columns}
              loading={
                estadoFormulario.filtering ||
                estadoFormulario.loadingProfissionais
              }
              sortColumn={filters?.sortColumn}
              sortType={filters?.sortType}
              onSortColumn={handleSortColumn}
              onRowClick={onRowClick}
              page={Number(filters?.page) || 1}
              limit={10}
              total={Number(pagination?.total) || 0}
              onChangePage={handleChangePage}
              rowHeight={isMobile ? 50 : 60}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profissionais;
