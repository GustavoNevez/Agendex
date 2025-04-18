import { Button, Icon, Tag } from 'rsuite';
import CustomModal from '../../components/Modal'; // Import our reusable Modal component
import ScheduleManager from '../../components/ScheduleManager';
import 'rsuite/dist/styles/rsuite-default.css';
import { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../context/auth';
import { allServicos } from '../../store/modules/servico/actions';
import { allProfissionais, updateProfissional, addProfissional, resetProfissional, removeProfissional, saveProfissional } from '../../store/modules/profissional/actions';
import { showSuccessToast } from '../../utils/notifications';

const Profissionais = () => {
    const dispatch = useDispatch();
    const { profissionais, profissional, estadoFormulario, componentes, comportamento } = useSelector(state => state.profissional) || {};
    const { servicos } = useSelector(state => state.servico) || { servicos: [] };
    // Use AuthContext directly like the Agendamentos page
    const { user } = useContext(AuthContext);
    const [selectedServices, setSelectedServices] = useState([]);
    const [showScheduleManager, setShowScheduleManager] = useState(false);
    const [selectedProfissionalId, setSelectedProfissionalId] = useState(null);
    
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
    
    const handleOpenScheduleManager = (profissionalId, e) => {
      if (e) {
        e.stopPropagation();
      }
      
      if (!user || !estabelecimentoId) {
        alert('Você precisa estar logado para gerenciar horários');
        return;
      }
      
      setSelectedProfissionalId(profissionalId);
      setShowScheduleManager(true);
    };

    const selecionarComponente = (componente, state) => {
        dispatch(updateProfissional({
            componentes: { ...componentes, [componente]: state },
        }));
    };

    const selecionarProfissional = (key, value) => {
        dispatch(updateProfissional({
            profissional: { ...profissional, [key]: value }
        }));
    };

    const onRowClick = (profissional) => {
        dispatch(
            updateProfissional({
                profissional,
                comportamento: 'update',
            })
        );
        setSelectedServices(profissional.servicosId || []);
        selecionarComponente('drawer', true);
    };

    const save = () => {
        // Garantir que os serviços selecionados sejam salvos
        selecionarProfissional('servicosId', selectedServices);
        
        if (comportamento === 'create') {
            dispatch(addProfissional());
        } else {
            selecionarComponente('confirmUpdate', true);
        }
    };

    const confirmSave = () => {
        dispatch(saveProfissional());
        selecionarComponente('confirmUpdate', false);
    };

    const remove = () => {
        dispatch(removeProfissional());
        showSuccessToast("Profissional removido com sucesso!");
    };

    useEffect(() => {
        dispatch(allProfissionais());
        dispatch(allServicos());
    }, [dispatch]);

    // Quando o profissional muda (especialmente ao clicar em uma linha), atualiza os serviços selecionados
    useEffect(() => {
        if (profissional && profissional.servicosId) {
            setSelectedServices(profissional.servicosId);
        } else {
            setSelectedServices([]);
        }
    }, [profissional]);

    const toggleService = (serviceId) => {
        setSelectedServices(prevSelected => {
            if (prevSelected.includes(serviceId)) {
                return prevSelected.filter(id => id !== serviceId);
            } else {
                return [...prevSelected, serviceId];
            }
        });
    };

    return (
        <div className="col p-4 overflow-auto h-100 " style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            {/* Professional modal with standardized styling */}
            <div
                className={componentes.drawer ? "professional-manager-overlay" : ""}
                style={{
                    display: componentes.drawer ? 'flex' : 'none',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1050,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '15px'
                }}
                onClick={(e) => {
                    // Close when clicking the overlay background
                    if (e.target === e.currentTarget) {
                        selecionarComponente('drawer', false);
                        dispatch(resetProfissional());
                        setSelectedServices([]);
                    }
                }}
            >
                <div
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        width: window.innerWidth < 768 ? '100%' : '500px',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{
                        padding: '15px 20px',
                        borderBottom: '1px solid #e5e5e5',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h4 style={{
                            margin: 0,
                            fontSize: window.innerWidth < 768 ? '1.1rem' : '1.25rem'
                        }}>
                            {comportamento === "create" ? "Cadastrar profissional" : "Atualizar profissional"}
                        </h4>
                        <Button appearance="subtle" onClick={() => {
                            selecionarComponente('drawer', false);
                            dispatch(resetProfissional());
                            setSelectedServices([]);
                        }}>
                            <Icon icon="close" />
                        </Button>
                    </div>
                    
                    {/* Body */}
                    <div style={{ 
                        padding: '15px', 
                        overflowY: 'auto',
                        maxHeight: 'calc(90vh - 130px)'
                    }}>
                        <div className="row mt-3">
                            <div className="form-group col-12 mb-3">
                                <b>Nome</b>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nome do profissional"
                                    value={profissional.nome}
                                    onChange={(e) => selecionarProfissional('nome', e.target.value)}
                                />
                            </div>
                            <div className="form-group col-12 mb-3">
                                <b>Link Personalizado</b>
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">public/p/</span>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="seu-link-personalizado"
                                        value={profissional.customLink || ''}
                                        onChange={(e) => {
                                            // Remove espaços e caracteres especiais
                                            const value = e.target.value.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
                                            selecionarProfissional('customLink', value);
                                        }}
                                    />
                                </div>
                                <small className="text-muted">
                                    Este link permitirá que clientes acessem diretamente seu perfil para agendamentos.
                                </small>
                                {profissional.customLink && (
                                    <div className="mt-2 d-flex justify-content-end">
                                        <button 
                                            className="btn btn-sm btn-outline-primary" 
                                            onClick={() => {
                                                navigator.clipboard.writeText(`http://localhost:3000/public/p/${profissional.customLink}`);
                                                showSuccessToast("Link copiado para a área de transferência!");
                                            }}
                                        >
                                            <Icon icon="copy" /> Copiar URL
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="form-group col-6">
                                <b>E-mail</b>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="E-mail do profissional"
                                    value={profissional.email}
                                    onChange={(e) => selecionarProfissional('email', e.target.value)}
                                />
                            </div>
                            <div className="form-group col-6">
                                <b>Telefone</b>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="(42)98888-3333"
                                    value={profissional.telefone}
                                    onChange={(e) => selecionarProfissional('telefone', e.target.value)}
                                />
                            </div>
                            <div className="form-group col-12">
                                <b>Especialidade</b>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Especialidade do profissional"
                                    value={profissional.especialidade}
                                    onChange={(e) => selecionarProfissional('especialidade', e.target.value)}
                                />
                            </div>
                            <div className="form-group col-12">
                                <b>Status</b>
                                <select
                                    className="form-control"
                                    value={profissional.status}
                                    onChange={(e) => selecionarProfissional('status', e.target.value)}
                                >
                                    <option value="A">Ativo</option>
                                    <option value="I">Inativo</option>
                                </select>
                            </div>

                            {/* Seção de vinculação de serviços */}
                            <div className="form-group col-12 mt-3">
                                <b>Serviços oferecidos</b>
                                <div className="mt-2 border p-3 rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {servicos.length === 0 ? (
                                        <p className="text-muted">Nenhum serviço cadastrado</p>
                                    ) : (
                                        <div className="row">
                                            {servicos.map((servico) => (
                                                <div key={servico.id} className="col-6 mb-2">
                                                    <div 
                                                        className={`service-item p-2 rounded ${selectedServices.includes(servico.id) ? 'bg-primary text-white' : 'border'}`}
                                                        onClick={() => toggleService(servico.id)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div className="d-flex align-items-center">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={selectedServices.includes(servico.id)} 
                                                                readOnly
                                                                className="mr-2"
                                                            />
                                                            <div>
                                                                <div>{servico.titulo}</div>
                                                                <small>R$ {parseFloat(servico.preco).toFixed(2)}</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            block
                            className="btn-lg mt-3"
                            color="green"
                            size="lg"
                            loading={estadoFormulario.saving}
                            onClick={save}
                            disabled={
                                !profissional.nome ||
                                !profissional.email ||
                                !profissional.telefone ||
                                !profissional.especialidade ||
                                selectedServices.length === 0
                            }
                        >
                            <Icon icon="save" /> Salvar Profissional
                        </Button>

                        {comportamento === "update" && (
                            <Button
                                loading={estadoFormulario.saving}
                                color="red"
                                size="lg"
                                block
                                onClick={() => selecionarComponente('confirmDelete', true)}
                                className="mt-1"
                            >
                                <Icon icon="trash" /> Remover Profissional
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modals using CustomModal */}
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
                    <p className="mt-3">Tem certeza que deseja excluir este profissional?</p>
                    <p className="text-danger">Esta ação não pode ser desfeita.</p>
                </div>
            </CustomModal>

            <CustomModal
                show={componentes.confirmUpdate}
                onClose={() => selecionarComponente('confirmUpdate', false)}
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
                    <Icon
                        icon="remind"
                        style={{ color: '#ffb300', fontSize: 24 }}
                    />
                    <p className="mt-3">Tem certeza que deseja atualizar este profissional?</p>
                </div>
            </CustomModal>

            <div className="row">
                <div className="col-12">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-5">
                        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                            <h2 className="font-semibold text-gray-800 mb-0">Profissionais</h2>
                            <button
                                className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
                                onClick={() => {
                                    dispatch(updateProfissional({
                                        comportamento: 'create',
                                    }));
                                    dispatch(resetProfissional());
                                    setSelectedServices([]);
                                    selecionarComponente('drawer', true);
                                }}
                            >
                                <span className="mdi mdi-plus">Novo Profissional</span>
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
                                            Especialidade
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Link Personalizado
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {estadoFormulario.filtering ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 text-center">
                                                <Icon icon="spinner" spin /> Carregando...
                                            </td>
                                        </tr>
                                    ) : componentes.drawer ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 text-center">
                                                <Icon icon="spinner" spin /> Carregando...
                                            </td>
                                        </tr>
                                    ) : profissionais.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 text-center">
                                                Nenhum profissional cadastrado!
                                            </td>
                                        </tr>
                                    ) : (
                                        profissionais.map(profissional => (
                                            <tr key={profissional.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onRowClick(profissional)}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
                                                            {profissional.nome ? profissional.nome.charAt(0) : '?'}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{profissional.nome}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{profissional.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{profissional.telefone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{profissional.especialidade}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${profissional.status === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {profissional.status === 'A' ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {profissional.customLink ? (
                                                        <div className="flex justify-center">
                                                            <button 
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigator.clipboard.writeText(`http://localhost:3000/public/p/${profissional.customLink}`);
                                                                    showSuccessToast("Link copiado para a área de transferência!");
                                                                }}
                                                            >
                                                                <Icon icon="copy" /> Copiar URL
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">Não definido</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Button color="blue" size="xs" className="mr-1" onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRowClick(profissional);
                                                    }}>
                                                        Ver informações
                                                    </Button>
                                                    <Button 
                                                        color="cyan" 
                                                        size="xs" 
                                                        onClick={(e) => handleOpenScheduleManager(profissional.id, e)}
                                                        disabled={!estabelecimentoId}
                                                    >
                                                        <Icon icon="calendar" /> Horários
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

            {/* Componente de gerenciamento de horários */}
            {showScheduleManager && selectedProfissionalId && estabelecimentoId && (
                <ScheduleManager
                    estabelecimentoId={estabelecimentoId}
                    profissionalId={selectedProfissionalId}
                    isOpen={showScheduleManager}
                    onClose={() => {
                        setShowScheduleManager(false);
                        setSelectedProfissionalId(null);
                    }}
                />
            )}
            
            {/* Aviso quando não há usuário logado */}
            {!user && (
                <div className="alert alert-warning mt-4">
                    <Icon icon="exclamation-triangle" /> Para gerenciar horários de profissionais, você precisa estar logado no sistema.
                </div>
            )}
        </div>
    );
};

export default Profissionais;