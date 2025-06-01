import { Button, Icon, Tag, InputGroup, Input } from 'rsuite';
import TableHeaderCustom from '../../components/TableHeaderCustom'; // Add this import
import CustomButton from '../../components/CustomButton'; // Adicione este import
import CustomModal from '../../components/Modal'; // Import our reusable Modal component
import CustomDrawer, { MaskedInput } from '../../components/CustomDrawer'; // Import our new CustomDrawer component with MaskedInput
import CustomTable from '../../components/CustomTable';
import useMediaQuery from '../../hooks/useMediaQuery';
import 'rsuite/dist/styles/rsuite-default.css';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { allClientes, updateClientes, filterCliente, addCliente, resetCliente, unlinkCliente } from '../../store/modules/cliente/actions';
import { showSuccessToast } from '../../utils/notifications';

const Clientes = () => {
    const dispatch = useDispatch();
    const { clientes, cliente, estadoFormulario, componentes, comportamento } = useSelector(state => state.clientes);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [sortColumn, setSortColumn] = useState();
    const [sortType, setSortType] = useState();
    const [searchKeyword, setSearchKeyword] = useState('');
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const isMobile = useMediaQuery('(max-width: 768px)');

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const selecionarComponente = (componente, state) => {
        dispatch(updateClientes({
            componentes: { ...componentes, [componente]: state },
        }));
    };
    const selecionarEstado = (componente, state) => {
        dispatch(updateClientes({
            estadoFormulario: { ...estadoFormulario, [componente]: state },
        }));
    };

    const selecionarCliente = (key, value) => {
        const updatedCliente = { ...cliente };

        if (key === 'documento') {
            updatedCliente.documento = {
                ...updatedCliente.documento || {},
                ...value
            };
        } else if (key === 'endereco') {
            updatedCliente.endereco = {
                ...updatedCliente.endereco || {},
                ...value
            };
        } else {
            updatedCliente[key] = value;
        }

        dispatch(updateClientes({
            cliente: updatedCliente
        }));
    }

    const onRowClick = (cliente) => {    
        dispatch(
            updateClientes({
                cliente: {
                    ...cliente,
                    documento: cliente.documento || { tipo: 'cpf', numero: '' },
                    endereco: cliente.endereco || { 
                        cep: '', 
                        rua: '', 
                        numero: '', 
                        uf: '', 
                        cidade: '' 
                    }
                },
                comportamento: 'update',
            })
        );
        
        selecionarComponente('drawer', true);
    };


    const save = () => {
        dispatch(addCliente());
        selecionarEstado('disabled', true);
    }

    const remove = () => {
        dispatch(unlinkCliente());
        showSuccessToast("Cliente removido com sucesso!")
    }
    useEffect(() => {
        dispatch(allClientes());

    }, [dispatch])

    const getData = () => {
        if (searchKeyword) {
            return clientes.filter(item => {
                return item.nome.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                    item.email.toLowerCase().includes(searchKeyword.toLowerCase());
            });
        }
        return clientes;
    };

    const handleSortColumn = (sortColumn, sortType) => {
        setSortColumn(sortColumn);
        setSortType(sortType);
    };

    const filteredData = getData();
    const total = filteredData.length;
    
    const sortedData = filteredData
        .sort((a, b) => {
            if (sortColumn && sortType) {
                const x = a[sortColumn];
                const y = b[sortColumn];
                if (typeof x === 'string') {
                    return sortType === 'asc' ? x.localeCompare(y) : y.localeCompare(x);
                }
                return sortType === 'asc' ? x - y : y - x;
            }
            return 0;
        })
        .slice((page - 1) * limit, page * limit);

    const columns = [
        {
            key: 'nome',
            label: 'Nome',
            width: isMobile ? 200 : 180,
            sortable: true,
            render: (value, rowData) => (
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
                        {value ? value.charAt(0) : '?'}
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{value}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'email',
            label: 'E-mail',
            width: 200,
            hideOnMobile: true,
            sortable: true
        },
        {
            key: 'telefone',
            label: 'Telefone',
            width: 150,
            hideOnMobile: true,
            sortable: true
        },
        {
            key: 'actions',
            label: 'Ações',
            width: isMobile ? 130 : 120,
            fixed: 'right',
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
            )
        }
    ];

    const isSmallScreen = windowWidth < 768;

    return (
        <div className="col p-4 overflow-auto h-100" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            {/* Client drawer using our reusable CustomDrawer component */}
            <CustomDrawer
                show={componentes.drawer}
                onClose={() => {
                    selecionarComponente('drawer', false);
                    dispatch(resetCliente());
                }}
                title={comportamento === "create" ? "Cadastrar cliente" : "Atualizar cliente"}
                primaryActionLabel={isSmallScreen && comportamento === "create" ? null : (comportamento === "create" ? "Salvar Cliente" : null)}
                primaryActionIcon={comportamento === "create" ? "save" : null}
                primaryActionColor="green"
                primaryActionDisabled={
                    !cliente.email ||
                    !cliente.nome ||
                    !cliente.telefone
                }
                onPrimaryAction={comportamento === "create" ? save : null}
                secondaryActionLabel={comportamento === "create" ? null : "Remover Cliente"}
                secondaryActionColor="red"
                onSecondaryAction={
                    comportamento === "create"
                        ? null
                        : () => selecionarComponente('confirmDelete', true)
                }
                loading={estadoFormulario.saving}
                size="md"
            >
                {/* Sticky save button for small screens */}
                {isSmallScreen && comportamento === "create" && (
                    <div style={{
                        padding: '10px 0px',
                        borderBottom: '1px solid #e5e5e5',
                        position: 'sticky',
                        top: 0,
                        backgroundColor: 'white',
                        zIndex: 10
                    }}>
                        <Button
                            block
                            color="green"
                            size="md"
                            loading={estadoFormulario.saving}
                            onClick={save}
                            disabled={
                                !cliente.email ||
                                !cliente.nome ||
                                !cliente.telefone
                            }
                        >
                            <Icon icon="save" /> Salvar Cliente
                        </Button>
                    </div>
                )}

                <div className="row mt-3">
                    <div className="form-group col-12 mb-3">
                        <b>E-mail*</b>
                        <div className="input-group">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email do cliente"
                                value={cliente.email}
                                onChange={(e) => {
                                    selecionarCliente('email', e.target.value);
                                }}
                            />
                        </div>
                    </div>
                    <div className="form-group col-6">
                        <b className="">Nome*</b>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nome do Cliente"
                            value={cliente.nome}
                            onChange={(e) => selecionarCliente('nome', e.target.value)}
                        />
                    </div>
                    <div className="form-group col-6">
                        <b className="">Telefone/Whatsapp*</b>
                        <MaskedInput
                            type="text"
                            placeholder="(42)98888-3333"
                            value={cliente.telefone}
                            onChange={(e) => selecionarCliente('telefone', e.target.value)}
                            mask="phone"
                        />
                    </div>
                    <div className="form-group col-6">
                        <b>Tipo de documento</b>
                        <select
                            className="form-control"
                            value={cliente.documento.tipo}
                            onChange={(e) =>
                                selecionarCliente('documento', {
                                    ...cliente.documento,
                                    tipo: e.target.value,
                                })}
                        >
                            <option value="cpf">CPF</option>
                            <option value="rg">RG</option>
                        </select>
                    </div>
                    <div className="form-group col-6">
                        <b className="">Número do documento</b>
                        {cliente.documento.tipo === 'cpf' ? (
                            <MaskedInput
                                type="text"
                                placeholder="000.000.000-00"
                                value={cliente.documento.numero}
                                onChange={(e) =>
                                    selecionarCliente('documento', {
                                        ...cliente.documento,
                                        numero: e.target.value,
                                    })}
                                mask="cpf"
                            />
                        ) : (
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Número do documento"
                                value={cliente.documento.numero}
                                onChange={(e) =>
                                    selecionarCliente('documento', {
                                        ...cliente.documento,
                                        numero: e.target.value,
                                    })}
                            />
                        )}
                    </div>
                    <div className="form-group col-3">
                        <b className="">CEP</b>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="000000-00"
                            value={cliente.endereco.cep}
                            onChange={(e) =>
                                selecionarCliente('endereco', {
                                    ...cliente.endereco,
                                    cep: e.target.value,
                                })}
                        />
                    </div>
                    <div className="form-group col-6">
                        <b className="">Rua</b>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Av. Exemplo"
                            value={cliente.endereco.rua}
                            onChange={(e) =>
                                selecionarCliente('endereco', {
                                    ...cliente.endereco,
                                    rua: e.target.value,
                                })}
                        />
                    </div>
                    <div className="form-group col-3">
                        <b className="">Número</b>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="0"
                            value={cliente.endereco.numero}
                            onChange={(e) =>
                                selecionarCliente('endereco', {
                                    ...cliente.endereco,
                                    numero: e.target.value,
                                })}
                        />
                    </div>
                    <div className="form-group col-3">
                        <b className="">UF</b>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Parana"
                            value={cliente.endereco.uf}
                            onChange={(e) =>
                                selecionarCliente('endereco', {
                                    ...cliente.endereco,
                                    uf: e.target.value,
                                })}
                        />
                    </div>
                    <div className="form-group col-9">
                        <b className="">Cidade</b>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Cidade"
                            value={cliente.endereco.cidade}
                            onChange={(e) =>
                                selecionarCliente('endereco', {
                                    ...cliente.endereco,
                                    cidade: e.target.value,
                                })}
                        />
                    </div>
                </div>
            </CustomDrawer>

            {/* Confirmation Modal using CustomModal */}
            <CustomModal
                show={componentes.confirmDelete}
                onClose={() => selecionarComponente('confirmDelete', false)}
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
                    <Icon
                        icon="remind"
                        style={{ color: '#ffb300', fontSize: 24 }}
                    />
                    <p className="mt-3">Tem certeza que deseja excluir este cliente?</p>
                    <p className="text-danger">Esta ação não pode ser desfeita.</p>
                </div>
            </CustomModal>
            <div className="row">
                <div className="col-12">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-5 border border-gray-200">
                        <TableHeaderCustom 
                            title="Clientes"
                            searchPlaceholder="Buscar por nome ou email..."
                            searchKeyword={searchKeyword}
                            onSearchChange={setSearchKeyword}
                            buttonLabel="Adicionar cliente"
                            buttonIcon="plus"
                            isMobile={isMobile}
                            onButtonClick={() => {
                                dispatch(updateClientes({
                                    comportamento: 'create',
                                }));
                                selecionarComponente('drawer', true);
                            }}
                        />
                        <CustomTable
                            data={sortedData}
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



export default Clientes;