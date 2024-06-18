import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRelatorio } from '../../store/modules/relatorio/actions';
import { DatePicker, Button, Panel, Table } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';
import moment from 'moment';

const { Column, HeaderCell, Cell } = Table;

const Relatorio = () => {
    const dispatch = useDispatch();
    const { relatorio, loading } = useSelector((state) => state.relatorio);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        const startOfLastMonth = moment().subtract(1, 'months').startOf('month');
        const endOfLastMonth = moment().subtract(1, 'months').endOf('month');

        setStartDate(startOfLastMonth.toDate());
        setEndDate(endOfLastMonth.toDate());

        dispatch(fetchRelatorio(startOfLastMonth.format('YYYY-MM-DD'), endOfLastMonth.format('YYYY-MM-DD')));
    }, [dispatch]);

    const handleFetchRelatorio = () => {
        if (startDate && endDate) {
            dispatch(fetchRelatorio(moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD')));
        }
    };

    const formatAgendamentos = (agendamentos) => {
        return agendamentos.map(agendamento => ({
            id: agendamento._id,
            cliente: agendamento.clienteId.length > 0 ? agendamento.clienteId[0].nome : 'N/A',
            servico: agendamento.servicoId.length > 0 ? agendamento.servicoId[0].titulo : 'N/A',
            data: moment(agendamento.data).format('DD/MM/YYYY'),
            valor: agendamento.valor ? `R$ ${agendamento.valor.toFixed(2)}` : 'N/A'
        }));
    };

    return (
        <div className="relatorio-container col p-5 overflow-auto h-100">
            <div className="row">
                <div className="col-12">
                    <h2 className="mb-4 mt-0">Relatório de Agendamentos</h2>
                    <div className="d-flex mb-3">
                        <DatePicker 
                            placeholder="Data de Início"
                            value={startDate}
                            onChange={setStartDate}
                            style={{ marginRight: 10 }}
                        />
                        <DatePicker 
                            placeholder="Data de Fim"
                            value={endDate}
                            onChange={setEndDate}
                            style={{ marginRight: 10 }}
                        />
                        <Button appearance="primary" onClick={handleFetchRelatorio}>Gerar Relatório</Button>
                    </div>
                    {loading ? (
                        <p>Carregando...</p>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between mb-4">
                                <Panel bordered shaded className="relatorio-panel" style={{ width: '48%', padding: '20px', textAlign: 'center' }}>
                                    <h3>Agendamentos Finalizados</h3>
                                    <p style={{ fontSize: '2em', margin: 0 }}>{relatorio.numeroAgendamentos}</p>
                                </Panel>
                                <Panel bordered shaded className="relatorio-panel" style={{ width: '48%', padding: '20px', textAlign: 'center' }}>
                                    <h3>Receita</h3>
                                    <p style={{ fontSize: '2em', margin: 0 }}>R$ {relatorio.totalDinheiro.toFixed(2)}</p>
                                </Panel>
                            </div>
                            <Table
                                data={formatAgendamentos(relatorio.agendamentos)}
                                height={400}
                                bordered
                                cellBordered
                            >
                                <Column width={500} align="center" fixed>
                                    <HeaderCell>Cliente</HeaderCell>
                                    <Cell dataKey="cliente" />
                                </Column>
                                <Column width={500} align="center">
                                    <HeaderCell>Serviço</HeaderCell>
                                    <Cell dataKey="servico" />
                                </Column>
                                <Column width={200} align="center">
                                    <HeaderCell>Data</HeaderCell>
                                    <Cell dataKey="data" />
                                </Column>
                                <Column width={200} align="center">
                                    <HeaderCell>Valor</HeaderCell>
                                    <Cell dataKey="valor" />
                                </Column>
                            </Table>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Relatorio;
