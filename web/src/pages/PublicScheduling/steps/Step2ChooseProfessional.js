import React from 'react';
import { Icon } from 'rsuite';

const Step2ChooseProfessional = ({ publicData, formState, setFormState, setStep, fetchAvailableDates }) => (
    <div className="p-4" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
        <h2 className="text-xl text-gray-900 font-bold mb-3 text-center">Escolha um profissional</h2>
        <div className="space-y-4">
            {publicData.profissionais.map(professional => (
                <div
                    key={professional.id}
                    onClick={() => {
                        setFormState({ ...formState, profissionalId: professional.id });
                        setStep(3);
                        fetchAvailableDates();
                    }}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md active:bg-gray-100 transition"
                >
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Icon icon="user" />
                        </div>
                        <div className="ml-4">
                            <div className="font-bold pb-1">{professional.nome}</div>
                            <div className="text-sm text-gray-500">{professional.especialidade}</div>
                        </div>
                    </div>
                    <Icon icon="angle-right" />
                </div>
            ))}
        </div>
    </div>
);

export default Step2ChooseProfessional;
