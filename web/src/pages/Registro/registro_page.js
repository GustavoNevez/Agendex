import React, { useState, useContext } from "react";
import { Link, Redirect } from "react-router-dom";
import { AuthContext } from "../../context/auth";
import teste from "../../assets/teste.png";


export const Register = () => {
  const [nome, setName] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setPassword] = useState("");
  const { signUp, signed } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = {
      nome,
      email,
      senha,
    };
    await signUp(data);
    setIsLoading(false);
  };

  if (signed) {
    return <Redirect to="/agendamentos" />;
  }

  return (
    <div className="min-h-screen w-full flex">
      <div className="hidden lg:!flex w-1/2 bg-[#4169E1] flex-col justify-center px-12 relative overflow-hidden">
        <div className="absolute top-12 left-20">
          <img src={teste} alt="Agendex" width="180" />
        </div>
        <div className="relative left-10 z-10">
          <h1 className="text-4xl font-bold text-white mb-6">
            Crie sua conta!
          </h1>
          <p className="text-xl text-white/90">
            Junte-se ao melhor sistema de gestão de agendamentos de serviço!
          </p>
        </div>
        <div className="absolute bottom-0 right-0 opacity-10">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="white">
            <circle cx="100" cy="100" r="100" />
          </svg>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Criar Conta</h2>
            <p className="text-sm text-gray-600 mt-1">
              Preencha os campos abaixo para se cadastrar
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                id="nome"
                type="text"
                className={`w-full px-3 py-2 border rounded-md bg-[#FFFFF0] focus:outline-none focus:ring-2 focus:ring-[#4169E1] ${
                  nome !== "" ? "border-[#4169E1]" : "border-gray-300"
                }`}
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className={`w-full px-3 py-2 border rounded-md bg-[#FFFFF0] focus:outline-none focus:ring-2 focus:ring-[#4169E1] ${
                  email !== "" ? "border-[#4169E1]" : "border-gray-300"
                }`}
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                className={`w-full px-3 py-2 border rounded-md bg-[#FFFFF0] focus:outline-none focus:ring-2 focus:ring-[#4169E1] ${
                  senha !== "" ? "border-[#4169E1]" : "border-gray-300"
                }`}
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#4169E1] hover:bg-[#3154B3] text-white font-bold rounded-md transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>

          <div className="text-center text-sm mt-6">
            <span className="text-gray-600">Já possui uma conta? </span>
            <Link to="/login" className="text-[#4169E1] hover:underline">
              Acessar agora
            </Link>
          </div>

          <p className="text-xs text-center text-gray-500 mt-8">
            Utilizamos cookies para melhorar sua experiência em nossos serviços. 
            Ao realizar seu cadastro, consideramos que você aceita esta utilização. 
            Para mais informações, acesse nossa{" "}
            <Link to="/privacidade" className="text-[#4169E1] hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
