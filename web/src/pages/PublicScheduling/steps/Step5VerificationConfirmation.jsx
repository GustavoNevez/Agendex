import React from 'react';
import { Button } from 'rsuite';

const Step5VerificationConfirmation = ({
    isRegistering,
    verificationStep,
    smsCode,
    setSmsCode,
    handleVerifySms,
    isVerifyingSms,
    handleCreateAppointment,
    submitting,
    ServiceSummaryCard
}) => {
    if (isRegistering && verificationStep === 2) {
        return (
            <div className="p-4 animate-fade-in">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mt-4">
                    <h3 className="text-lg font-semibold text-violet-700 mb-4">
                        Verificação por SMS
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Digite o código de verificação enviado para seu telefone
                    </p>
                    <input
                        type="text"
                        maxLength="6"
                        className="w-full p-3 text-center text-2xl tracking-wider border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none mb-4"
                        value={smsCode}
                        onChange={e => setSmsCode(e.target.value)}
                        placeholder="0000"
                    />
                    <Button
                        className='bg-violet-500 text-white hover:bg-violet-700 transition-all px-4 py-2 duration-200 text-base font-semibold w-full rounded'
                        onClick={handleVerifySms}
                        loading={isVerifyingSms}
                        disabled={isVerifyingSms}
                    >
                        Verificar Código
                    </Button>
                </div>
            </div>
        );
    }
    if (isRegistering && verificationStep === 3) {
        return (
            <div className="p-4 animate-fade-in">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-violet-700 mb-4">
                        Confirmar Agendamento
                    </h3>
                    <ServiceSummaryCard />
                    <div className="mt-6">
                        <Button
                            className='bg-violet-500 text-white hover:bg-violet-700 transition-all px-4 py-2 duration-200 text-base font-semibold w-full rounded'
                            onClick={handleCreateAppointment}
                            loading={submitting}
                            disabled={submitting}
                        >
                            Finalizar Agendamento
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-violet-700 mb-4">
                    Confirmar Agendamento
                </h3>
                <ServiceSummaryCard />
                <div className="mt-6">
                    <Button
                        className='bg-violet-500 text-white hover:bg-violet-700 transition-all px-4 py-2 duration-200 text-base font-semibold w-full rounded'
                        onClick={handleCreateAppointment}
                        loading={submitting}
                        disabled={submitting}
                    >
                        Confirmar Agendamento
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Step5VerificationConfirmation;
