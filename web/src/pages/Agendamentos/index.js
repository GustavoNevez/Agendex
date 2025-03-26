import React, { useEffect, useState, useContext } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/pt-br';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { filtroAgendamento, fetchServicos, fetchClientes, fetchDiasDisponiveis, saveAgendamento, deleteAgendamento, finalizeAgendamento, updateAgendamento } from '../../store/modules/agendamento/actions';
import util from '../../util';
import { Drawer, Button, SelectPicker, DatePicker, Modal, Icon, Panel } from 'rsuite';
// Removed conflicting rsuite CSS import
import { AuthContext } from '../../context/auth';
import { useAgendamento } from '../../context/agendamentoContext';
import { MoreVertical } from 'lucide-react';

const localizer = momentLocalizer(moment);

const Agendamentos = () => {
    const dispatch = useDispatch();
    const { agendamentos, servicos, diasDisponiveis, clientes } = useSelector((state) => state.agendamento);
    const { isModalOpen, closeModal } = useAgendamento();
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [confirmSave, setConfirmSave] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmFinalize, setConfirmFinalize] = useState(false);
    // Escutar por mudanças no estado do modal no contexto
    useEffect(() => {
        if (isModalOpen) {
            handleAddAppointment();
            closeModal();
        }
    }, [isModalOpen, closeModal]);
    useEffect(() => {
        dispatch(fetchServicos());
        dispatch(fetchClientes());
        dispatch(filtroAgendamento(
            moment().weekday(0).format('YYYY-MM-DD'),
            moment().weekday(30).format('YYYY-MM-DD')
        ));
    }, [dispatch]);

    useEffect(() => {
        if (selectedService && selectedDate) {
            const storedUser = localStorage.getItem("@Auth:user");
            const user = JSON.parse(storedUser);
            dispatch(fetchDiasDisponiveis(user.id, moment(selectedDate).format('YYYY-MM-DD'), selectedService));
        }
    }, [selectedService, selectedDate, dispatch]);

    useEffect(() => {
        if (selectedDate) {
            const selectedDay = moment(selectedDate).format('YYYY-MM-DD');
            const availableTimesForDay = diasDisponiveis.find(dia => dia[selectedDay]);
            setAvailableTimes(availableTimesForDay ? availableTimesForDay[selectedDay] : []);
        }
    }, [diasDisponiveis, selectedDate]);

    const formatEventos = agendamentos.map((agendamento) => {
        const nomesClientes = agendamento.clienteId.map((cliente) => cliente.nome).join(", ");
        const titulosServicos = agendamento.servicoId.map((servico) => servico.titulo).join(", ");
        return {
            _id: agendamento._id,
            title: `${nomesClientes} - ${titulosServicos}`,
            start: moment(agendamento.data).toDate(),
            end: moment(agendamento.data).add(util.horaParaMinutos(moment(agendamento.servicoId[0].duracao).format('HH:mm')), 'minutes').toDate(),
        };
    });

    const formatRange = (periodo) => {
        let finalRange = {};
        if (Array.isArray(periodo)) {
            finalRange = {
                start: moment(periodo[0]).format('YYYY-MM-DD'),
                end: moment(periodo[periodo.length - 1]).format('YYYY-MM-DD'),
            };
        } else {
            finalRange = {
                start: moment(periodo.start).format('YYYY-MM-DD'),
                end: moment(periodo.end).format('YYYY-MM-DD'),
            };
        }
        return finalRange;
    };

    const messages = {
        allDay: 'Dia todo',
        previous: 'Anterior',
        next: 'Próximo',
        today: 'Hoje',
        month: 'Mês',
        week: 'Semana',
        day: 'Dia',
        agenda: 'Agenda',
        date: 'Data',
        time: 'Hora',
        event: 'Cliente/Serviço',
        noEventsInRange: 'Não há eventos neste período.',
        showMore: total => `+ Ver mais (${total})`,
    };

    const handleAddAppointment = () => {
        setSelectedAppointment(null);
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedClient(null);
        setSelectedPrice(null);
        setDrawerOpen(true);
    };

    const handleSaveAppointment = () => {
        setConfirmSave(true);
    };

    const confirmSaveAppointment = () => {
        if (selectedService && selectedDate && selectedTime && selectedClient) {
            const storedUser = localStorage.getItem("@Auth:user");
            const user = JSON.parse(storedUser);
            const agendamento = {
                estabelecimentoId: user.id,
                data: moment(`${moment(selectedDate).format('YYYY-MM-DD')}T${selectedTime}`).toISOString(),
                servicoId: selectedService,
                clienteId: selectedClient,
                valor: selectedPrice,
            };
            dispatch(saveAgendamento(agendamento));
            setDrawerOpen(false);
            setConfirmSave(false);
            handleUpdateAppointments();
            dispatch(updateAgendamento(agendamentos));
            const start = moment().weekday(0).format('YYYY-MM-DD');
            const end = moment().weekday(30).format('YYYY-MM-DD');
            dispatch(filtroAgendamento(start, end));
        }
    };

    const handleDeleteAppointment = () => {
        setConfirmDelete(true);
    };

    const handleFinalizeAppointment = () => {
        setConfirmFinalize(true);
    };

    const confirmDeleteAppointment = () => {
        if (selectedAppointment) {
            dispatch(deleteAgendamento(selectedAppointment._id));
            setDrawerOpen(false);
            setConfirmDelete(false);
            dispatch(updateAgendamento(agendamentos));
        }
    };

    const confirmFinalizeAppointment = () => {
        if (selectedAppointment) {
            dispatch(finalizeAgendamento(selectedAppointment._id));
            setDrawerOpen(false);
            setConfirmFinalize(false);
            dispatch(updateAgendamento(agendamentos));
            
        }
    };

    const handleUpdateAppointments = () => {
        const start = moment().weekday(0).format('YYYY-MM-DD');
        const end = moment().weekday(30).format('YYYY-MM-DD');
        dispatch(filtroAgendamento(start, end));
    };

    const handleSelectEvent = (event) => {
        setSelectedAppointment(event);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setSelectedAppointment(null);
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedClient(null);
        setSelectedPrice(null);
        setDrawerOpen(false);
    };

    const isSaveButtonEnabled = selectedService && selectedDate && selectedTime && selectedClient;

    const { user } = useContext(AuthContext);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Agendamentos</h2>
                <Button appearance="primary" color="green" size="lg" onClick={handleAddAppointment}>
                    <Icon icon="plus" /> Novo Agendamento
                </Button>
            </div>
            
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <Panel shaded bordered bodyFill style={{ backgroundColor: '#e8f4fc', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <div className="p-3">
                            <div className="flex items-center">
                                <Icon icon="calendar" style={{ fontSize: '24px', marginRight: '10px', color: '#2196f3' }} />
                                <div>
                                    <h4 style={{ color: '#555', margin: 0 }}>Total de Agendamentos</h4>
                                    <h2 style={{ color: '#2196f3', marginTop: '5px' }}>{agendamentos.length}</h2>
                                </div>
                            </div>
                        </div>
                    </Panel>
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <Panel shaded bordered bodyFill style={{ backgroundColor: '#e3fcef', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <div className="p-3">
                            <div className="flex items-center">
                                <Icon icon="clock-o" style={{ fontSize: '24px', marginRight: '10px', color: '#4caf50' }} />
                                <div>
                                    <h4 style={{ color: '#555', margin: 0 }}>Agendamentos Futuros</h4>
                                    <h2 style={{ color: '#4caf50', marginTop: '5px' }}>
                                        {agendamentos.filter(a => moment(a.data).isAfter(moment())).length}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </Panel>
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <Panel shaded bordered bodyFill style={{ backgroundColor: '#fff0e8', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <div className="p-3">
                            <div className="flex items-center">
                                <Icon icon="check" style={{ fontSize: '24px', marginRight: '10px', color: '#ff9800' }} />
                                <div>
                                    <h4 style={{ color: '#555', margin: 0 }}>Agendamentos Finalizados</h4>
                                    <h2 style={{ color: '#ff9800', marginTop: '5px' }}>
                                        {agendamentos.filter(a => a.finalizado).length}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </Panel>
                </div>
            </div>
                        
            {/* Refresh Button */}
            <div className="flex justify-end mb-3">
                <Button appearance="ghost" onClick={handleUpdateAppointments}>
                    <Icon icon="refresh" /> Atualizar
                </Button>
            </div>
        
            <Calendar
                localizer={localizer}
                onRangeChange={(periodo) => {
                    const { start, end } = formatRange(periodo);
                    dispatch(filtroAgendamento(start, end));
                }}
                events={formatEventos}
                style={{ height: '50vh', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                selectable
                popup
                defaultView='month'
                messages={messages}
                onSelectEvent={handleSelectEvent}
            />

                <Drawer show={drawerOpen} onHide={handleCloseDrawer} size="sm">
                    <Drawer.Body className="overflow-hidden">
                        <h3>{selectedAppointment ? "Informações do Agendamento" : "Adicionar Agendamento"}</h3>
                        {selectedAppointment ? (
                            <div className="mt-3 space-y-3">
                                <div className="mb-3">
                                    <label className="block font-medium mb-1"><b>Cliente/Serviço</b></label>
                                    <p>{selectedAppointment.title}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="mb-3">
                                        <label className="block font-medium mb-1"><b>Data</b></label>
                                        <p>{moment(selectedAppointment.start).format('YYYY-MM-DD')}</p>
                                    </div>
                                    <div className="mb-3">
                                        <label className="block font-medium mb-1"><b>Horário</b></label>
                                        <p>{moment(selectedAppointment.start).format('HH:mm')} - {moment(selectedAppointment.end).format('HH:mm')}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-3 space-y-3">
                                <div className="mb-3">
                                    <label className="block font-medium mb-1"><b>Serviços</b></label>
                                    <SelectPicker
                                        data={servicos.map(servico => ({
                                            label: servico.titulo,
                                            value: servico.id,
                                        }))}
                                        style={{ width: '100%' }}
                                        value={selectedService}
                                        onChange={(value) => {
                                            setSelectedService(value);
                                            const selected = servicos.find(servico => servico.id === value);
                                            setSelectedPrice(selected ? selected.preco : null);
                                        }}
                                        placeholder="Todos serviços disponiveis"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block font-medium mb-1"><b>Clientes</b></label>
                                    <SelectPicker
                                        data={clientes.map(cliente => ({
                                            label: cliente.nome,
                                            value: cliente.id,
                                        }))}
                                        style={{ width: '100%' }}
                                        value={selectedClient}
                                        onChange={setSelectedClient}
                                        placeholder="Todos clientes ativos"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="mb-3">
                                        <label className="block font-medium mb-1"><b>Data</b></label>
                                    <DatePicker
                                        format="YYYY-MM-DD"
                                        style={{ width: '100%' }}
                                        value={selectedDate}
                                        onChange={setSelectedDate}
                                        placeholder="Selecione uma data"
                                    />
                                    </div>
                                    <div className="mb-3">
                                        <label className="block font-medium mb-1"><b>Horário</b></label>
                                    <SelectPicker
                                        data={availableTimes.map(time => ({
                                            label: time,
                                            value: time,
                                        }))}
                                        style={{ width: '100%' }}
                                        value={selectedTime}
                                        onChange={setSelectedTime}
                                        placeholder="Selecione um horário"
                                    />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end mt-4 space-x-2">
                            {selectedAppointment && (
                                <Button block size="lg" appearance="primary" color="green" onClick={handleFinalizeAppointment} className="mr-2">
                                    <Icon icon="check" /> Finalizar Agendamento
                                </Button>
                            )}
                            {selectedAppointment ? (
                                <Button block size="lg" appearance="primary" color="red" onClick={handleDeleteAppointment}>
                                    <Icon icon="trash" /> Deletar
                                </Button>
                            ) : (
                                <Button block size="lg" appearance="primary" color="green" onClick={handleSaveAppointment} disabled={!isSaveButtonEnabled}>
                                    <Icon icon="save" /> Salvar
                                </Button>
                            )}
                        </div>
                    </Drawer.Body>
                </Drawer>

                <Modal backdrop="static" show={confirmSave} onHide={() => setConfirmSave(false)} size="sm">
                    <Modal.Body>
                        <Icon icon="remind" style={{ color: '#ffb300', fontSize: 24 }} />
                        {' '}Tem certeza que deseja salvar o agendamento?
                        <div className="mt-3">
                            <p><b>Serviço:</b> {servicos.find(servico => servico.id === selectedService)?.titulo}</p>
                            <p><b>Cliente:</b> {clientes.find(cliente => cliente.id === selectedClient)?.nome}</p>
                            <p><b>Data:</b> {moment(selectedDate).format('YYYY-MM-DD')}</p>
                            <p><b>Horário:</b> {selectedTime}</p>
                            <p><b>Preço:</b> R$ {selectedPrice}</p>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={confirmSaveAppointment} appearance="primary">
                            Sim
                        </Button>
                        <Button onClick={() => setConfirmSave(false)} appearance="subtle">
                            Não
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal backdrop="static" show={confirmDelete} onHide={() => setConfirmDelete(false)} size="sm">
                    <Modal.Body>
                        <Icon icon="remind" style={{ color: '#ffb300', fontSize: 24 }} />
                        {' '}Tem certeza que deseja deletar o agendamento?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={confirmDeleteAppointment} appearance="primary">
                            Sim
                        </Button>
                        <Button onClick={() => setConfirmDelete(false)} appearance="subtle">
                            Não
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal backdrop="static" show={confirmFinalize} onHide={() => setConfirmFinalize(false)} size="md">
                    <Modal.Body>
                        <Icon icon="remind" style={{ color: '#ffb300', fontSize: 24 }} />
                        {' '}Tem certeza que deseja finalizar o agendamento?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={confirmFinalizeAppointment} appearance="primary">
                            Sim
                        </Button>
                        <Button onClick={() => setConfirmFinalize(false)} appearance="subtle">
                            Não
                        </Button>
                    </Modal.Footer>
                </Modal>
        </div>
    );
};

export default Agendamentos;