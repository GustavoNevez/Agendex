import { Button, Icon, Tag, DatePicker } from 'rsuite';
import CustomModal from '../../components/Modal'; // Import our reusable Modal component
import CustomDrawer from '../../components/CustomDrawer'; // Import our new CustomDrawer component
import moment from 'moment';
import 'rsuite/dist/styles/rsuite-default.css';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { allServicos, updateServico, addServico, resetServico, removeServico, saveServicos } from '../../store/modules/servico/actions';
import {  showSuccessToast } from '../../utils/notifications';

const Servicos = () => {
    const dispatch = useDispatch();
    const { servicos, servico, estadoFormulario, componentes, comportamento } = useSelector(state => state.servico);

    const selecionarComponente = (componente, state) => {
        dispatch(updateServico({
            componentes: { ...componentes, [componente]: state },
        }));
    };

    const selecionarServico = (key, value) => {
        dispatch(updateServico({
            servico: { ...servico, [key]: value }
        }));
    };

    const onRowClick = (servico) => {
        dispatch(
            updateServico({
                servico,
                comportamento: 'update',
            })
        );
        selecionarComponente('drawer', true);
    };

    const save = () => {
        if (comportamento === 'create') {
            dispatch(addServico());
            selecionarComponente('confirmUpdate', false);
            showSuccessToast('Adicionado com sucesso!');
        } else {
            dispatch(saveServicos());
            selecionarComponente('confirmUpdate', false);
            showSuccessToast('Salvo com sucesso!');
        }
    };

    const remove = () => {
        dispatch(removeServico());
        showSuccessToast('Removido com sucesso!');
    };

    useEffect(() => {
        dispatch(allServicos());
    }, [dispatch]);


    return (
        <div className="col p-4 overflow-auto h-100 " style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            {/* Service drawer using our reusable CustomDrawer component */}
            <CustomDrawer
                show={componentes.drawer}
                onClose={() => {
                    selecionarComponente('drawer', false);
                    dispatch(resetServico());
                }}
                title={comportamento === "create" ? "Cadastrar serviço" : "Atualizar serviço"}
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
                    if (comportamento === 'create') {
                        save();
                    } else {
                        selecionarComponente('confirmUpdate', true);
                    }
                }}
                secondaryActionLabel={comportamento === "update" ? "Remover Serviço" : null}
                secondaryActionColor="red"
                onSecondaryAction={
                    comportamento === "update" 
                        ? () => selecionarComponente('confirmDelete', true)
                        : null
                }
                loading={estadoFormulario.saving}
                size="md"
            >
                <div className="row mt-2">
                    <div className="form-group col-md-6 col-sm-12 mb-3">
                        <b className="">Título</b>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nome do serviço"
                            value={servico.titulo}
                            onChange={(e) => selecionarServico('titulo', e.target.value)}
                        />
                    </div>
                    <div className="form-group col-md-6 col-sm-12 mb-3">
                        <b className="">R$ Preço</b>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="0"
                            value={servico.preco}
                            onChange={(e) => selecionarServico('preco', e.target.value)}
                        />
                    </div>
                    
                    <div className="form-group col-md-4 col-sm-12 mb-3">
                        <b className="d-block">Duração</b>
                        <select
                            className="form-control"
                            value={servico.duracao ? moment(servico.duracao).format('HH:mm') : '00:30'}
                            onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':').map(Number);
                                const duration = moment().hours(hours).minutes(minutes).toDate();
                                selecionarServico('duracao', duration);
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
                            onChange={(e) => selecionarServico('recorrencia', e.target.value)}
                        />
                    </div>
                    <div className="form-group col-md-4 col-sm-12 mb-3">
                        <b className="">Status</b>
                        <select
                            className="form-control"
                            value={servico.status}
                            onChange={(e) => selecionarServico('status', e.target.value)}
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
                            onChange={(e) => selecionarServico('descricao', e.target.value)}
                        ></textarea>
                    </div>
                </div>
            </CustomDrawer>
            {/* Confirmation Modal for Delete using CustomModal */}
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
                    <p className="mt-2">Tem certeza que deseja excluir este serviço?</p>
                    <p className="text-danger">Esta ação não pode ser desfeita.</p>
                </div>
            </CustomModal>
            
            {/* Confirmation Modal for Update using CustomModal */}
            <CustomModal
                show={componentes.confirmUpdate}
                onClose={() => selecionarComponente('confirmUpdate', false)}
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
                    <Icon
                        icon="remind"
                        style={{ color: '#ffb300', fontSize: 24 }}
                    />
                    <p className="mt-3">Tem certeza que deseja atualizar este serviço?</p>
                </div>
            </CustomModal>
            <div className="row">
                <div className="col-12">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-5">
                        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                            <h2 className="font-semibold text-gray-800 mb-0">Serviços</h2>
                            <button 
                                className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
                                onClick={() => {
                                    dispatch(updateServico({
                                        comportamento: 'create',
                                    }));
                                    dispatch(resetServico({
                                        comportamento: 'create',
                                    }));
                                    selecionarComponente('drawer', true);
                                }}
                            >
                                <span className="mdi mdi-plus">Novo serviço</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Título
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Preço
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Recorrência (dias)
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Duração
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {estadoFormulario.filtering ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center">
                                                <Icon icon="spinner" spin /> Carregando...
                                            </td>
                                        </tr>
                                    ) : componentes.drawer ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center">
                                                <Icon icon="spinner" spin /> Carregando...
                                            </td>
                                        </tr>
                                    ) : servicos.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center">
                                                Nenhum serviço cadastrado!
                                            </td>
                                        </tr>
                                    ) : (
                                        servicos.map(servico => (
                                            <tr key={servico.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onRowClick(servico)}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
                                                            {servico.titulo ? servico.titulo.charAt(0) : '?'}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{servico.titulo}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">R$ {parseFloat(servico.preco).toFixed(2)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{servico.recorrencia}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{servico.duracao ? moment(servico.duracao).format('HH:mm') : 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${servico.status === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {servico.status === 'A' ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Button color="blue" size="xs" onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRowClick(servico);
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
    );
};

export default Servicos;
