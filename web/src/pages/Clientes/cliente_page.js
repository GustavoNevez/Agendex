import {Button, Icon} from 'rsuite';
import CustomModal from '../../components/Modal'; // Import our reusable Modal component
import CustomDrawer, { MaskedInput } from '../../components/CustomDrawer'; // Import our new CustomDrawer component with MaskedInput
import Table from '../../components/Table';
import 'rsuite/dist/styles/rsuite-default.css';
import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {allClientes, updateClientes,filterCliente,addCliente, resetCliente,unlinkCliente} from '../../store/modules/cliente/actions';
import { showSuccessToast } from '../../utils/notifications';

const Clientes = () => {
    const dispatch = useDispatch();
    const {clientes,cliente, estadoFormulario,componentes,comportamento} = useSelector(state=>state.clientes);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const selecionarComponente = (componente, state) => {
        dispatch(updateClientes({
            componentes: {...componentes, [componente]: state},
        }));
    };
    const selecionarEstado = (componente, state) => {
        dispatch(updateClientes({
            estadoFormulario: {...estadoFormulario, [componente]: state},
        }));
    };

    const selecionarCliente = (key, value) => {
        dispatch(updateClientes({
            cliente:{...cliente, [key]: value}
        }))
    }

    const onRowClick = (cliente) => {    
        dispatch(
          updateClientes({
            cliente,
            comportamento: 'update',
          })
        );
        
        selecionarComponente('drawer', true);
      };
    

    const save = () => {
        dispatch(addCliente());
        selecionarEstado('disabled',true);
    }

    const remove = () => {
        dispatch(unlinkCliente());
        showSuccessToast("Cliente removido com sucesso!")
    }
    useEffect(() => {
        dispatch(allClientes());
       
    }, [dispatch])
    
    const isSmallScreen = windowWidth < 768;
    
    return (
        <div className="col p-4 overflow-auto h-100 " style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
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
                    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-5">
                        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                            <h2 className="font-semibold text-gray-800 mb-0">Clientes</h2>
                            <button 
                                className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
                                onClick={() => {
                                    dispatch(updateClientes({
                                        comportamento: 'create',
                                    }));
                                    selecionarComponente('drawer', true);
                                }}
                            >
                                <span className="mdi mdi-plus">Novo Cliente</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nome
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            E-mail
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Telefone
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {estadoFormulario.filtering ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center">
                                                <Icon icon="spinner" spin /> Carregando...
                                            </td>
                                        </tr>
                                    ) : componentes.drawer ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center">
                                                <Icon icon="spinner" spin /> Carregando...
                                            </td>
                                        </tr>
                                    ) : clientes.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center">
                                                Nenhum cliente cadastrado!
                                            </td>
                                        </tr>
                                    ) : (
                                        clientes.map(cliente => (
                                            <tr key={cliente.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onRowClick(cliente)}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
                                                            {cliente.nome ? cliente.nome.charAt(0) : '?'}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{cliente.nome}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{cliente.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{cliente.telefone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Button color="blue" size="xs" onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRowClick(cliente);
                                                    }}>
                                                        Ver informações
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};



export default Clientes;