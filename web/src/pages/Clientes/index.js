import {Button,Drawer,Modal,Icon} from 'rsuite';
import Table from '../../components/Table';
import 'rsuite/dist/styles/rsuite-default.css';
import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {allClientes, updateClientes,filterCliente,addCliente, resetCliente,unlinkCliente} from '../../store/modules/cliente/actions';
import { showSuccessToast } from '../../utils/notifications';

const Clientes = () => {
    const dispatch = useDispatch();
    const {clientes,cliente, estadoFormulario,componentes,comportamento} = useSelector(state=>state.clientes);
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
    return (
        <div className="col p-5 overflow-auto h-100 ">
            <Drawer show={componentes.drawer} 
                    size="sm" 
                    onHide={() => {
                        selecionarComponente('drawer',false)
                        dispatch(resetCliente())
                        
                        }}>
                <Drawer.Body className="overflow-hidden">
                    <h3>{comportamento === "create" ? "Cadastrar cliente" : "Atualizar cliente"}</h3>
                    <div className="row mt-3">
                        <div className="form-group col-12 mb-3">
                            <b>E-mail</b>
                            <div className="input-group">
                                <input type="email" 
                                    className="form-control" 
                                    placeholder="Email do cliente" 
                                    value={cliente.email} 
                                    onChange={(e) => {
                                        selecionarCliente('email', e.target.value);
                                    }}
                                />
                                <div className="input-group-append">
                                    <Button
                                         
                                        appearance="primary" 
                                        loading={estadoFormulario.filtering} 
                                        disable={estadoFormulario.filtering} 
                                        onClick={ 
                                            
                                            () => {
                                               
                                            dispatch(filterCliente())
                                        }}>Pesquisar</Button>
                                </div>
                            </div>
                        </div>
                        <div className="form-group col-6">
                            <b className="">Nome</b>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nome do Cliente"
                                disabled={estadoFormulario.disabled}
                                value={cliente.nome}
                                onChange={(e) => selecionarCliente('nome', e.target.value)
                                    
                                }
                             
                            />
                        </div>
                        <div className="form-group col-6">
                            <b className="">Telefone/Whatsapp</b>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="(42)98888-3333"
                                disabled={estadoFormulario.disabled}
                                value={cliente.telefone}
                                onChange={(e) => selecionarCliente('telefone', e.target.value)}
                            />
                        </div>
                        <div className="form-group col-6">
                            <b>Tipo de documento</b>
                            <select
                                disabled={estadoFormulario.disabled}
                                className="form-control"
                                
                                value={cliente.documento.tipo}
                                onChange={(e) =>
                                selecionarCliente('documento', {
                                    ...cliente.documento,
                                    tipo: e.target.value,
                                })
                                }
                            >
                                <option value="cpf">CPF</option>
                                <option value="rg">RG</option>
                            </select>
                        </div>
                        <div className="form-group col-6">
                            <b className="">Número do documento</b>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="000.000.000-00"
                                disabled={estadoFormulario.disabled}
                                value={cliente.documento.numero}
                                onChange={(e) =>
                                selecionarCliente('documento', {
                                    ...cliente.documento,
                                    numero: e.target.value,
                                })
                                }
                            />
                        </div>
                        <div className="form-group col-3">
                            <b className="">CEP</b>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="000000-00"
                                disabled={estadoFormulario.disabled}
                                value={cliente.endereco.cep}
                                onChange={(e) =>
                                selecionarCliente('endereco', {
                                    ...cliente.endereco,
                                    cep: e.target.value,
                                })
                                }
                            />
                        </div>
                        <div className="form-group col-6">
                            <b className="">Rua</b>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Av. Exemplo"
                                disabled={estadoFormulario.disabled}
                                value={cliente.endereco.rua}
                                onChange={(e) =>
                                selecionarCliente('endereco', {
                                    ...cliente.endereco,
                                    rua: e.target.value,
                                })
                                }
                            />
                        </div>
                        <div className="form-group col-3">
                            <b className="">Número</b>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="0"
                                disabled={estadoFormulario.disabled}
                                value={cliente.endereco.numero}
                                onChange={(e) =>
                                selecionarCliente('endereco', {
                                    ...cliente.endereco,
                                    numero: e.target.value,
                                })
                                }
                            />
                        </div>
                        <div className="form-group col-3">
                            <b className="">UF</b>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Parana"
                                disabled={estadoFormulario.disabled}
                                value={cliente.endereco.uf}
                                onChange={(e) =>
                                selecionarCliente('endereco', {
                                    ...cliente.endereco,
                                    uf: e.target.value,
                                })
                                }
                            />
                        </div>
                        <div className="form-group col-9">
                            <b className="">Cidade</b>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Cidade"
                                disabled={estadoFormulario.disabled}
                                value={cliente.endereco.cidade}
                                onChange={(e) =>
                                selecionarCliente('endereco', {
                                    ...cliente.endereco,
                                    cidade: e.target.value,
                                })
                                }
                            />
                        </div>
                    </div>
                    <Button block className="btn-lg mt-3" color={comportamento === "create" ? 'green' : 'red'} size="lg" loading={estadoFormulario.saving}
                        onClick={() => {
                            if (comportamento === "create") {
                                save();
                         } else {
                            selecionarComponente('confirmDelete', true);
                        }
                        
                    }}
                    disabled={
                        !cliente.email ||
                        !cliente.nome ||
                        !cliente.telefone ||
                        !cliente.documento.numero ||
                        !cliente.endereco.cep ||
                        !cliente.endereco.rua ||
                        !cliente.endereco.numero ||
                        !cliente.endereco.uf ||
                        !cliente.endereco.cidade
                        }>
                        {comportamento ==="create" ?  'Salvar' : 'Remover'} Clientes
                    </Button>
                    
                </Drawer.Body>
            
            </Drawer>
            <Modal
                show={componentes.confirmDelete}
                onHide={() => selecionarComponente('confirmDelete', false)}
                size="sm"
            >
                <Modal.Body >
                <Icon
                    icon="remind"
                    style={{
                    color: '#ffb300',
                    fontSize: 24,
                    }}
                />
                {'  '} Tem certeza que deseja excluir? Essa ação será irreversível!
                </Modal.Body>
                <Modal.Footer>
                <Button loading={estadoFormulario.saving} onClick={() => remove()} color="red">
                    Sim, tenho certeza!
                </Button>
                <Button
                    onClick={() => selecionarComponente('confirmDelete', false)}
                    appearance="subtle"
                >
                    Cancelar
                </Button>
                </Modal.Footer>
            </Modal>
            <div className="row">
                <div className="col-12">
                    <div className='w-100 d-flex justify-content-between'>
                        <h2 className="mb-4 mt-0">Clientes</h2>
                        <div>
                            <button className="btn btn-primary btn-lg" 
                                    onClick={() =>{
                                        dispatch(updateClientes({
                                                comportamento:'create',
                                            })
                                        );
                                        selecionarComponente('drawer',true);
                                     }}
                            >
                                <span className="mdi mdi-plus">Novo Cliente</span>
                            </button>
                        </div>
                    </div>                
                        <Table
                            className="table-container overflow-hidden"
                            loading={estadoFormulario.filtering}
                            data={componentes.drawer ? [] : clientes}
                            config={[
                                    {label: 'Nome', key: 'nome', width: 333, fixed:true},
                                    {label: 'E-mail', key: 'email', width: 333, fixed:true},
                                    {label: 'Telefone', key: 'telefone', width: 333, fixed:true},                    
                                ]}
                                actions={(cliente) => (           
                                    <Button color="blue" size="xs">Ver informações</Button>
                                )}
                                onRowClick={(cliente) => onRowClick(cliente)}
                                locale="Nenhum cliente cadastrado!"
                        />         
                </div>
            </div>
        </div>
    )
};



export default Clientes;