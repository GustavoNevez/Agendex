import React, { useState } from 'react';
import { Button, Input, Message } from 'rsuite';
import api from '../../services/api';
import { showErrorToast, showSuccessToast } from '../../utils/notifications';

const SMSVerification = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    estabelecimentoId: '67fc615745995e205d2cf4d5' // Substitua pelo ID real do estabelecimento
  });
  const [verificationCode, setVerificationCode] = useState('');

  const handleRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Enviando dados:', formData);
      // Note que mudamos o endpoint para /cliente/registro
      const response = await api.post('/public/cliente/registro', formData);
      
      console.log('Resposta do servidor:', response.data);
      
      if (!response.data.error) {
        showSuccessToast('Código enviado com sucesso!');
        setStep(2);
      } else {
        showErrorToast(response.data.message || 'Erro ao registrar cliente');
      }
    } catch (error) {
      console.error('Erro completo:', error);
      showErrorToast(error.response?.data?.message || 'Erro ao enviar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Enviando código:', verificationCode);
      const response = await api.post('/public/cliente/verificar', {
        code: verificationCode,
        email: formData.email, // Adicionando email para identificação
        telefone: formData.telefone, // Adicionando telefone para identificação
        estabelecimentoId: '67fc615745995e205d2cf4d5'
      });
      
      console.log('Resposta da verificação:', response.data);

      if (!response.data.error) {
        showSuccessToast('Verificação concluída com sucesso!');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        showErrorToast(response.data.message || 'Código inválido');
      }
    } catch (error) {
      console.error('Erro completo:', error);
      showErrorToast(error.response?.data?.message || 'Erro ao verificar código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            {step === 1 ? 'Registro de Cliente' : 'Verificação SMS'}
          </h2>
          <p className="text-gray-600">
            {step === 1 
              ? 'Preencha seus dados para receber o código de verificação' 
              : 'Digite o código recebido por SMS'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRegistration} className="mt-8 space-y-6">
            <div className="space-y-4">
              <Input
                placeholder="Nome completo"
                value={formData.nome}
                onChange={value => setFormData({...formData, nome: value})}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={value => setFormData({...formData, email: value})}
                required
              />
              <Input
                placeholder="Telefone (ex: +5542999999999)"
                value={formData.telefone}
                onChange={value => setFormData({...formData, telefone: value})}
                required
              />
            </div>
            <Button
              appearance="primary"
              type="submit"
              loading={loading}
              block
            >
              Enviar Código
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerification} className="mt-8 space-y-6">
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Confirme seu Email"
                value={formData.email}
                onChange={value => setFormData({...formData, email: value})}
                required
              />
              <Input
                placeholder="Confirme seu Telefone"
                value={formData.telefone}
                onChange={value => setFormData({...formData, telefone: value})}
                required
              />
              <Input
                placeholder="Digite o código de 6 dígitos"
                value={verificationCode}
                onChange={setVerificationCode}
                required
              />
            </div>
            <Button
              appearance="primary"
              type="submit"
              loading={loading}
              block
            >
              Verificar Código
            </Button>
            <Button
              appearance="link"
              onClick={() => setStep(1)}
              block
            >
              Voltar
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SMSVerification;
