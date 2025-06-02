import { Button, Icon, Tag } from "rsuite";
import TableHeaderCustom from "../../components/TableHeaderCustom/table_header_custom";
import InputMask from "react-input-mask";
import CustomModal from "../../components/Modal/modal_custom";
import CustomDrawer from "../../components/Drawer/drawer_custom";
import CustomTable from "../../components/CustomTable/table_custom";
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
} from "../../store/modules/professional/professional_actions";
import { showSuccessToast } from "../../utils/notifications";
import useMediaQuery from "../../hooks/useMediaQuery";
import CustomButton from "../../components/Button/button_custom";

const Profissionais = () => {
  const dispatch = useDispatch();
  const {
    profissionais,
    profissional,
    estadoFormulario,
    componentes,
    comportamento,
  } = useSelector((state) => state.profissional) || {};
  const { servicos } = useSelector((state) => state.servico) || {
    servicos: [],
  };
  const [selectedServices, setSelectedServices] = useState([]);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
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
    dispatch(
      updateProfissional({
        profissional,
        comportamento: "update",
      })
    );
    setSelectedServices(profissional.servicosId || []);
    selecionarComponente("drawer", true);
  };

  const save = () => {
    selecionarProfissional("servicosId", selectedServices);

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

  const getData = () => {
    if (searchKeyword) {
      return profissionais.filter((item) => {
        return (
          item.nome.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          item.email.toLowerCase().includes(searchKeyword.toLowerCase())
        );
      });
    }
    return profissionais;
  };

  const filteredData = getData();
  const total = filteredData.length;

  const paginatedData = filteredData
    .sort((a, b) => {
      if (sortColumn && sortType) {
        const x = a[sortColumn];
        const y = b[sortColumn];
        if (typeof x === "string") {
          return sortType === "asc" ? x.localeCompare(y) : y.localeCompare(x);
        }
        return sortType === "asc" ? x - y : y - x;
      }
      return 0;
    })
    .slice((page - 1) * limit, page * limit);

  const handleSortColumn = (sortColumn, sortType) => {
    setSortColumn(sortColumn);
    setSortType(sortType);
  };

  const columns = [
    {
      key: "nome",
      label: "Nome",
      width: isMobile ? 200 : 180,
      sortable: true,
      render: (value, rowData) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
            {value ? value.charAt(0) : "?"}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{rowData.especialidade}</div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "E-mail",
      width: 200,
      hideOnMobile: true,
      sortable: true,
    },
    {
      key: "telefone",
      label: "Telefone",
      width: 150,
      hideOnMobile: true,
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      width: 100,
      hideOnMobile: true,
      sortable: true,
      render: (value) => (
        <Tag color={value === "A" ? "green" : "red"}>
          {value === "A" ? "Ativo" : "Inativo"}
        </Tag>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      width: isMobile ? 130 : 120,
      fixed: "right",
      render: (_, rowData) => (
        <CustomButton
          label="Ver informações"
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
        loading={estadoFormulario.saving}
      >
        <div className="row mt-2">
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
              searchKeyword={searchKeyword}
              onSearchChange={setSearchKeyword}
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
              data={paginatedData}
              columns={columns}
              loading={estadoFormulario.filtering || componentes.drawer}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={handleSortColumn}
              onRowClick={onRowClick}
              isMobile={isMobile}
              page={page}
              limit={limit}
              total={total}
              onChangePage={setPage}
              onChangeLimit={setLimit}
              rowHeight={isMobile ? 50 : 60}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profissionais;
