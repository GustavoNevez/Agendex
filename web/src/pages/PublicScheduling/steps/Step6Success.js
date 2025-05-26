import React from 'react';
import { Button, Icon } from 'rsuite';
import moment from 'moment';

const Step6Success = ({
    agendamentoData,
    publicData,
    type,
    resetForm,
    setStep,
    setCurrentScreen
}) => {
    if (!agendamentoData) return null;
    const selectedService =
        agendamentoData._service ||
        publicData.servicos.find(s => s.id === agendamentoData.servicoId || s._id === agendamentoData.servicoId) ||
        { titulo: 'Serviço', preco: 0 };
    const selectedProfissional =
        agendamentoData._profissional?.nome ||
        (type === 'p'
            ? publicData.profissional?.nome
            : (publicData.profissionais.find(p => p.id === agendamentoData.profissionalId || p._id === agendamentoData.profissionalId)?.nome)) ||
        'Profissional';
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg border border-violet-100 max-w-md w-full p-6">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                        <Icon icon="check-circle" className="text-green-500" style={{ fontSize: 40 }} />
                    </div>
                    <h2 className="text-2xl font-bold text-violet-700 mb-1 text-center">Agendamento Confirmado!</h2>
                    <p className="text-gray-600 text-center">Seu agendamento foi realizado com sucesso.</p>
                </div>
                <div className="mb-6">
                    <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 shadow-md">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide">Data e horário</p>
                                <p className="text-xl font-bold text-violet-700">
                                    {moment(agendamentoData.data).format('DD/MM/YYYY')} às {moment(agendamentoData.data).format('HH:mm')}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-semibold uppercase tracking-wide">Valor</p>
                                <p className="text-xl font-bold text-violet-700">
                                    R$ {selectedService?.preco?.toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg text-gray-800 font-bold">{selectedService?.titulo || 'Serviço'}</h2>
                            <p className="text-sm mt-1">
                                com <span className="font-semibold">{selectedProfissional}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        appearance="primary"
                        className="bg-violet-500 text-white hover:bg-violet-700 transition-all px-4 py-2 duration-200 text-base font-semibold w-full rounded"
                        onClick={resetForm}
                    >
                        Fazer novo agendamento
                    </Button>
                    <Button
                        appearance="ghost"
                        className="border border-violet-500 text-violet-700 hover:bg-violet-50 transition-all px-4 py-2 duration-200 text-base font-semibold w-full rounded"
                        onClick={() => {
                            setStep(1);
                            setCurrentScreen('reservas');
                        }}
                    >
                        Ver minhas reservas
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Step6Success;
