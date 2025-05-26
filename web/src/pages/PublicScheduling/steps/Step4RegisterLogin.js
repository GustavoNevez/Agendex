import React from 'react';
import { Button } from 'rsuite';

const Step4RegisterLogin = ({
    isRegistering,
    setIsRegistering,
    registrationError,
    setRegistrationError,
    triedSubmitRegister,
    setTriedSubmitRegister,
    triedSubmitLogin,
    setTriedSubmitLogin,
    touchedFieldsRegister,
    setTouchedFieldsRegister,
    touchedFieldsLogin,
    setTouchedFieldsLogin,
    handleSubmit,
    submitting,
    renderUserForm
}) => (
    <div className="p-4 animate-fade-in">
        {/* Botões Cadastrar/Login */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <Button
                className={`px-4 py-2 text-base font-semibold transition-all duration-200 rounded focus:outline-none focus:ring-0 active:bg-inherit
                    ${isRegistering
                        ? 'bg-violet-700 text-white'
                        : 'bg-white border border-violet-200 text-violet-700 hover:bg-violet-100'
                    }`}
                onClick={e => {
                    e.currentTarget.blur();
                    setIsRegistering(true);
                    setRegistrationError('');
                    setTriedSubmitRegister(false);
                    setTriedSubmitLogin(false);
                    setTouchedFieldsLogin({});
                }}
            >
                Cadastrar-se
            </Button>
            <Button
                className={`px-4 py-2 text-base font-semibold transition-all duration-200 rounded focus:outline-none focus:ring-0 active:bg-inherit
                    ${!isRegistering
                        ? 'bg-violet-700 text-white'
                        : 'bg-white border border-violet-200 text-violet-700 hover:bg-violet-100'
                    }`}
                onClick={e => {
                    e.currentTarget.blur();
                    setIsRegistering(false);
                    setRegistrationError('');
                    setTriedSubmitRegister(false);
                    setTriedSubmitLogin(false);
                    setTouchedFieldsRegister({});
                }}
            >
                Fazer Login
            </Button>
        </div>
        {/* Formulário */}
        <div className="max-w-xl mx-auto">
            {renderUserForm()}
        </div>
        {/* Botão de envio */}
        <div className="mt-6">
            <Button
                className='bg-violet-500 text-white hover:bg-violet-700 transition-all px-4 py-2 duration-200 text-base font-semibold w-full rounded'
                onClick={handleSubmit}
                loading={submitting}
                disabled={submitting}
            >
                {isRegistering ? "Confirmar Cadastro" : "Fazer Login"}
            </Button>
        </div>
    </div>
);

export default Step4RegisterLogin;
