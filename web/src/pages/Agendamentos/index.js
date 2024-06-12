import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/pt-br'; 
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { filtroAgendamento, fetchServicos, fetchClientes, fetchDiasDisponiveis, saveAgendamento, deleteAgendamento, updateAgendamento } from '../../store/modules/agendamento/actions';
import util from '../../util';
import { Drawer, Button, SelectPicker, DatePicker, Modal, Icon } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';


const localizer = momentLocalizer(moment);

const Agendamentos = () => {
    const dispatch = useDispatch();
    const { agendamentos, servicos, diasDisponiveis, clientes } = useSelector((state) => state.agendamento);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [confirmSave, setConfirmSave] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

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
        event: 'Evento',
        noEventsInRange: 'Não há eventos neste período.',
        showMore: total => `+ Ver mais (${total})`,
    };

    const handleAddAppointment = () => {
        setSelectedAppointment(null);
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedClient(null);
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
    
    const confirmDeleteAppointment = () => {
        if (selectedAppointment) {
            dispatch(deleteAgendamento(selectedAppointment._id));
            setDrawerOpen(false);
            setConfirmDelete(false);
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
        setDrawerOpen(false);
    };

    const isSaveButtonEnabled = selectedService && selectedDate && selectedTime && selectedClient;

    return (
        <div className="calendar-container col p-5 overflow-auto h-100">
            <div className="row">
                <div className="col-12">
                    <div className='w-100 d-flex justify-content-between'>
                        <h2 className="mb-4 mt-0">Agendamentos</h2>
                        <div>
                            <button className="btn btn-primary btn-lg" onClick={handleAddAppointment}>
                                <span className="mdi mdi-plus">Novo Agendamento</span>
                            </button>
                        </div>
                    </div>                   
                    <Calendar
                        localizer={localizer}
                        onRangeChange={(periodo) => {
                            const { start, end } = formatRange(periodo);
                            dispatch(filtroAgendamento(start, end));
                        }}
                        events={formatEventos}
                        style={{ height: '80vh' }}
                        selectable
                        popup
                        defaultView='month'
                        messages={messages}
                        onSelectEvent={handleSelectEvent} 
                    />
                </div>
            </div>

            <Drawer show={drawerOpen} onHide={handleCloseDrawer} size="sm">
                <Drawer.Body className="overflow-hidden">
                    
                    <h3>{selectedAppointment ? "Informações do Agendamento" : "Adicionar Agendamento"}</h3>
                    {selectedAppointment ? (
                        <div className="row mt-3">
                            <div className="form-group col-12 mb-3">
                                <label><b>Cliente/Serviço</b></label>
                                <p>{selectedAppointment.title}</p>
                            </div>
                            <div className="form-group col-6">
                                <label><b>Data</b></label>
                                <p>{moment(selectedAppointment.start).format('YYYY-MM-DD')}</p>
                            </div>
                            <div className="form-group col-6">
                                <label><b>Horário</b></label>
                                <p>{moment(selectedAppointment.start).format('HH:mm')} - {moment(selectedAppointment.end).format('HH:mm')}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="row mt-3">
                            <div className="form-group col-12 mb-3">
                                <label><b>Serviços</b></label>
                                <SelectPicker
                                    data={servicos.map(servico => ({
                                        label: servico.titulo,
                                        value: servico.id,
                                    }))}
                                    style={{ width: '100%' }}
                                    value={selectedService}
                                    onChange={setSelectedService}
                                    placeholder="Todos serviços disponiveis"
                                />
                            </div>
                            <div className="form-group col-12 mb-3">
                                <label><b>Clientes</b></label>
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
                            <div className="form-group col-6">
                                <label><b>Data</b></label>
                                <DatePicker
                                    format="YYYY-MM-DD"
                                    style={{ width: '100%' }}
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                    placeholder="Selecione uma data"
                                />
                            </div>
                            <div className="form-group col-6">
                                <label><b>Horário</b></label>
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
                    )}

                    <div className="d-flex justify-content-end">
                        {selectedAppointment ? (
                            <Button block className="btn-lg mt-3" size="lg" appearance="primary" color="red" onClick={handleDeleteAppointment}>
                               <Icon icon="trash" /> Deletar
                            </Button>
                        ) : (
                            <Button block className="btn-lg mt-3" size="lg" appearance="primary" color="green" onClick={handleSaveAppointment} disabled={!isSaveButtonEnabled}>
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
        </div>
    );
};

export default Agendamentos;
