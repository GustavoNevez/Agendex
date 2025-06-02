import React from 'react';
import { Icon } from 'rsuite';
import moment from 'moment';

function getServiceDurationFromUtc(utcDateString) {
    if (!utcDateString) return '';
    const end = moment(utcDateString);
    const start = moment(utcDateString).startOf('day');
    const diffMinutes = end.diff(start, 'minutes');
    if (diffMinutes < 60) return `${diffMinutes}min`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    let result = [];
    if (hours > 0) result.push(`${hours}h`);
    if (minutes > 0) result.push(`${minutes}min`);
    return result.length > 0 ? result.join(' ') : '0min';
}

const Step1ChooseService = ({ publicData, formState, setFormState, setStep, type }) => (
    <div className="p-4" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
        <h2 className="text-xl text-gray-900 font-bold mb-3 text-center">Escolha um serviço</h2>
        <div className="space-y-4">
            {publicData.servicos.map(service => (
                <div
                    key={service.id}
                    onClick={() => {
                        setFormState({ ...formState, servicoId: service.id });
                        setStep(type === 'p' ? 3 : 2);
                    }}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md active:bg-gray-100 transition"
                >
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white">
                            {service.titulo.charAt(0)}
                        </div>
                        <div className="ml-4">
                            <div className="font-bold pb-1">{service.titulo}</div>
                            <div className="text-sm text-gray-500 pb-1">
                                <p>Duração: {getServiceDurationFromUtc(service.duracao)}</p>
                            </div>
                            <div className="text-sm">R$ {service.preco.toFixed(2)}</div>
                        </div>
                    </div>
                    <Icon icon="angle-right" />
                </div>
            ))}
        </div>
    </div>
);

export default Step1ChooseService;
