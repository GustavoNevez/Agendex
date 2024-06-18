import { Button, Drawer, Modal, Icon, Tag, DatePicker } from 'rsuite';
import moment from 'moment';
import Table from '../../components/Table';
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
        <div className="col p-5 overflow-auto h-100 ">
            <Drawer show={componentes.drawer}
                size="sm"
                onHide={() => {
                    selecionarComponente('drawer', false);
                    dispatch(resetServico());
                }}>
                <Drawer.Body className="overflow-hidden">
                    <h3>{comportamento === "create" ? "Cadastrar serviço" : "Atualizar serviço"}</h3>
                    <div className="row mt-3">
                        <div className="form-group col-6">
                            <b className="">Título</b>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nome do serviço"
                                value={servico.titulo}
                                onChange={(e) => selecionarServico('titulo', e.target.value)}
                            />
                        </div>
                        <div className="form-group col-3">
                            <b className="">R$ Preço</b>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="0"
                                value={servico.preco}
                                onChange={(e) => selecionarServico('preco', e.target.value)}
                            />
                        </div>
                        <div className="form-group col-3">
                            <b className="">Recorr. (dias)</b>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="0"
                                value={servico.recorrencia}
                                onChange={(e) => selecionarServico('recorrencia', e.target.value)}
                            />
                        </div>
                        <div className="form-group col-4">
                            <b className="d-block">Duração</b>
                            <DatePicker
                                block
                                format="HH:mm"
                                value={servico.duracao}
                                hideMinutes={(min) => ![0, 30].includes(min)}
                                onChange={(e) => selecionarServico('duracao', e)}
                            />
                        </div>
                        <div className="form-group col-4">
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
                        <div className="form-group col-12">
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
                    <Button block
                        className="btn-lg mt-3"
                        color={comportamento === "create" ? 'green' : 'green'}
                        size="lg"
                        loading={estadoFormulario.saving}
                        onClick={() => {
                            if (comportamento === 'create') {
                                save();
                            } else {
                                selecionarComponente('confirmUpdate', true);
                            }
                        }}
                        disabled={
                            !servico.titulo || 
                            !servico.preco || 
                            !servico.recorrencia || 
                            !servico.duracao || 
                            !servico.status || 
                            !servico.descricao
                        }
                    >
                        <Icon icon="save" /> Salvar Serviço
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
                            <Icon icon="trash" /> Remover Serviço
                        </Button>
                    )}
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
                        style={{ color: '#ffb300', fontSize: 24 }}
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
            <Modal
                show={componentes.confirmUpdate}
                onHide={() => selecionarComponente('confirmUpdate', false)}
                size="sm"
            >
                <Modal.Body >
                    <Icon
                        icon="remind"
                        style={{ color: '#ffb300', fontSize: 24 }}
                    />
                    {'  '} Tem certeza que deseja atualizar esse cadastro?
                </Modal.Body>
                <Modal.Footer>
                    <Button loading={estadoFormulario.saving} onClick={() => save()} color="green">
                        Sim, tenho certeza!
                    </Button>
                    <Button
                        onClick={() => selecionarComponente('confirmUpdate', false)}
                        appearance="subtle"
                    >
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>
            <div className="row">
                <div className="col-12">
                    <div className='w-100 d-flex justify-content-between'>
                        <h2 className="mb-4 mt-0">Serviços</h2>
                        <div>
                            <button className="btn btn-primary btn-lg"
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
                    </div>
                    <Table
                        className="overflow-hidden"
                        loading={estadoFormulario.filtering}
                        data={servicos}
                        config={[
                            {
                                label: 'Título',
                                key: 'titulo',
                                fixed: true,
                                width: 200,
                            },
                            {
                                label: 'Preço',
                                key: 'preco',
                                content: (servico) => `R$ ${servico.toFixed(2)}`,
                            },
                            {
                                label: 'Recorrência (dias)',
                                key: 'recorrencia',
                            },
                            {
                                label: 'Duração',
                                key: 'duracao',
                                content: (servico) => moment(servico).format('HH:mm'),
                            },
                            {
                                label: 'Status',
                                key: 'status',
                                content: (status) => (
                                    <Tag color={status === 'A' ? 'green' : 'red'}>
                                        {status === 'A' ? 'Ativo' : 'Inativo'}
                                    </Tag>
                                ),
                            },
                        ]}
                        actions={(servico) => (
                            <Button color="blue" size="xs">Ver informações</Button>
                        )}
                        onRowClick={(servico) => onRowClick(servico)}
                        locale="Nenhum serviço cadastrado!"
                    />
                </div>
            </div>
        </div>
    );
};

export default Servicos;
