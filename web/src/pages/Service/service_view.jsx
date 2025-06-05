import { Icon, Tag } from "rsuite";
import CustomTable from "../../components/CustomTable/table_custom";
import CustomModal from "../../components/Modal/modal_custom"; // Import our reusable Modal component
import CustomDrawer from "../../components/Drawer/drawer_custom"; // Import our new CustomDrawer component
import CustomButton from "../../components/Button/button_custom";
import moment from "moment";
import "rsuite/dist/styles/rsuite-default.css";
import "rsuite-table/dist/css/rsuite-table.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  allServicos,
  updateServico,
  addServico,
  resetServico,
  removeServico,
  saveServicos,
} from "../../store/modules/service/service_actions";
import { showSuccessToast } from "../../utils/notifications";
import useMediaQuery from "../../hooks/useMediaQuery"; // Add this import
import TableHeaderCustom from "../../components/TableHeaderCustom/table_header_custom";

const Servicos = () => {
  const dispatch = useDispatch();
  const { servicos, servico, estadoFormulario, componentes, comportamento, filters, pagination } =
    useSelector((state) => state.servico);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const selecionarComponente = (componente, state) => {
    dispatch(
      updateServico({
        componentes: { ...componentes, [componente]: state },
      })
    );
  };

  const selecionarServico = (key, value) => {
    dispatch(
      updateServico({
        servico: { ...servico, [key]: value },
      })
    );
  };

  const onRowClick = (servico) => {
    dispatch(
      updateServico({
        servico,
        comportamento: "update",
      })
    );
    selecionarComponente("drawer", true);
  };

  const save = () => {
    if (comportamento === "create") {
      dispatch(addServico());
      selecionarComponente("confirmUpdate", false);
      showSuccessToast("Adicionado com sucesso!");
    } else {
      dispatch(saveServicos());
      selecionarComponente("confirmUpdate", false);
      showSuccessToast("Salvo com sucesso!");
    }
  };

  const remove = () => {
    dispatch(removeServico());
    showSuccessToast("Removido com sucesso!");
  };

  useEffect(() => {
    dispatch(allServicos());
  }, [dispatch, filters.page, filters.limit, filters.sortColumn, filters.sortType, filters.search]);

  const handleSearchChange = (value) => {
    dispatch(
      updateServico({
        filters: { ...filters, search: value, page: 1 },
      })
    );
    dispatch(allServicos());
  };

  const handleSortColumn = (sortColumn, sortType) => {
    dispatch(
      updateServico({
        filters: { ...filters, sortColumn, sortType },
      })
    );
    dispatch(allServicos());
  };

  const handleChangePage = (nextPage) => {
    dispatch(
      updateServico({
        filters: { ...filters, page: nextPage },
      })
    );
    dispatch(allServicos());
  };

  const handleChangeLimit = (limit) => {
    dispatch(
      updateServico({
        filters: { ...filters, limit, page: 1 },
      })
    );
    dispatch(allServicos());
  };

  const filteredData = servicos || [];
  const total = pagination?.total || 0;

  const columns = [
    {
      key: "titulo",
      label: "Título",
      width: isMobile ? 180 : 180,
      sortable: true,
    },
    {
      key: "preco",
      label: "Preço",
      width: 120,
      hideOnMobile: true,
      sortable: true,
      render: (value) => `R$ ${parseFloat(value).toFixed(2)}`,
    },
    {
      key: "recorrencia",
      label: "Recorrência",
      width: 120,
      hideOnMobile: true,
      sortable: true,
    },
    {
      key: "duracao",
      label: "Duração",
      width: 120,
      hideOnMobile: true,
      sortable: true,
      render: (value) => (value ? moment(value).format("HH:mm") : "N/A"),
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
      className="col p-4 overflow-auto h-100 "
      style={{ animation: "fadeIn 0.3s ease-in-out" }}
    >
      {/* Service drawer using our reusable CustomDrawer component */}
      <CustomDrawer
        show={componentes.drawer}
        onClose={() => {
          selecionarComponente("drawer", false);
          dispatch(resetServico());
        }}
        title={
          comportamento === "create" ? "Cadastrar serviço" : "Atualizar serviço"
        }
        primaryActionLabel="Salvar Serviço"
        primaryActionIcon="save"
        primaryActionColor="green"
        primaryActionDisabled={
          !servico.titulo ||
          !servico.preco ||
          !servico.recorrencia ||
          !servico.duracao ||
          !servico.status ||
          !servico.descricao
        }
        onPrimaryAction={() => {
          if (comportamento === "create") {
            save();
          } else {
            selecionarComponente("confirmUpdate", true);
          }
        }}
        secondaryActionLabel={
          comportamento === "update" ? "Remover Serviço" : null
        }
        secondaryActionColor="red"
        onSecondaryAction={
          comportamento === "update"
            ? () => selecionarComponente("confirmDelete", true)
            : null
        }
        loading={estadoFormulario.saving}
        size="md"
      >
        <div className="row mt-2 ">
          <div className="form-group col-md-6 col-sm-12 mb-3 ">
            <b className="">Título</b>
            <input
              type="text"
              className="form-control"
              placeholder="Nome do serviço"
              value={servico.titulo}
              onChange={(e) => selecionarServico("titulo", e.target.value)}
            />
          </div>
          <div className="form-group col-md-6 col-sm-12 mb-3">
            <b className="">R$ Preço</b>
            <input
              type="number"
              className="form-control"
              placeholder="0"
              value={servico.preco}
              onChange={(e) => selecionarServico("preco", e.target.value)}
            />
          </div>

          <div className="form-group col-md-4 col-sm-12 mb-3">
            <b className="d-block">Duração</b>
            <select
              className="form-control"
              value={
                servico.duracao
                  ? moment(servico.duracao).format("HH:mm")
                  : "00:30"
              }
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(":").map(Number);
                const duration = moment()
                  .hours(hours)
                  .minutes(minutes)
                  .toDate();
                selecionarServico("duracao", duration);
              }}
            >
              <option value="00:15">15 min</option>
              <option value="00:30">30 min</option>
              <option value="00:45">45 min</option>
              <option value="01:00">1 hora</option>
              <option value="01:30">1 hora e 30 min</option>
              <option value="02:00">2 horas</option>
              <option value="02:30">2 horas e 30 min</option>
              <option value="03:00">3 horas</option>
            </select>
          </div>
          <div className="form-group col-md-4 col-sm-12 mb-3">
            <b className="">Recorrência (dias)</b>
            <input
              type="number"
              className="form-control"
              placeholder="0"
              min="0"
              value={servico.recorrencia || ""}
              onChange={(e) => selecionarServico("recorrencia", e.target.value)}
            />
          </div>
          <div className="form-group col-md-4 col-sm-12 mb-3">
            <b className="">Status</b>
            <select
              className="form-control"
              value={servico.status}
              onChange={(e) => selecionarServico("status", e.target.value)}
            >
              <option value="A">Ativo</option>
              <option value="I">Inativo</option>
            </select>
          </div>
          <div className="form-group col-12 mb-3">
            <b className="">Descrição</b>
            <textarea
              rows="5"
              className="form-control"
              placeholder="Descrição do serviço..."
              value={servico.descricao}
              onChange={(e) => selecionarServico("descricao", e.target.value)}
            ></textarea>
          </div>
        </div>
      </CustomDrawer>
      {/* Confirmation Modal for Delete using CustomModal */}
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
          <p className="mt-2">Tem certeza que deseja excluir este serviço?</p>
          <p className="text-danger">Esta ação não pode ser desfeita.</p>
        </div>
      </CustomModal>

      {/* Confirmation Modal for Update using CustomModal */}
      <CustomModal
        show={componentes.confirmUpdate}
        onClose={() => selecionarComponente("confirmUpdate", false)}
        title="Confirmar Atualização"
        size="xs"
        primaryActionLabel="Sim, atualizar"
        primaryActionColor="green"
        primaryActionDisabled={estadoFormulario.saving}
        onPrimaryAction={save}
        secondaryActionLabel="Cancelar"
        loading={estadoFormulario.saving}
      >
        <div className="text-center">
          <Icon icon="remind" style={{ color: "#ffb300", fontSize: 24 }} />
          <p className="mt-3">Tem certeza que deseja atualizar este serviço?</p>
        </div>
      </CustomModal>
      <div className="row">
        <div className="col-12">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-5 border border-gray-200">
            <TableHeaderCustom
              title="Serviços"
              searchPlaceholder="Buscar por título..."
              searchKeyword={filters.search}
              onSearchChange={handleSearchChange}
              buttonLabel="Adicionar serviço"
              buttonIcon="plus"
              isMobile={isMobile}
              onButtonClick={() => {
                dispatch(updateServico({ comportamento: "create" }));
                dispatch(resetServico({ comportamento: "create" }));
                selecionarComponente("drawer", true);
              }}
            />
            <CustomTable
              data={filteredData}
              columns={columns}
              loading={estadoFormulario.filtering}
              sortColumn={filters?.sortColumn}
              sortType={filters?.sortType}
              onSortColumn={handleSortColumn}
              onRowClick={onRowClick}
              isMobile={isMobile}
              page={Number(filters?.page) || 1}
              limit={Number(filters?.limit) || 10}
              total={Number(total)}
              onChangePage={handleChangePage}
              onChangeLimit={handleChangeLimit}
              rowHeight={isMobile ? 50 : 60}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Servicos;
