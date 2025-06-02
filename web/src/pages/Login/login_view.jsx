import React, { useState, useContext } from "react";
import { Link, Redirect } from "react-router-dom";
import { AuthContext } from "../../context/auth_provider";
import { Eye, EyeOff } from "lucide-react";
import teste from "../../assets/teste.png";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signed } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = {
      email,
      senha,
    };
    await signIn(data);
    setIsLoading(false);
  };

  if (signed) {
    return <Redirect to="/agendamentos" />;
  }

  return (
    <div className="min-h-screen w-full flex">
      <div className="  hidden lg:!flex w-1/2 bg-[#4169E1] flex-col justify-center px-12 relative overflow-hidden ">
        <div className="absolute top-12 left-20">
          <img src={teste} alt="Agendex" width="180" />
        </div>
        <div className="relative left-10 z-10">
          <h1 className="text-4xl font-bold text-white mb-6">
            Seja bem-vindo!
          </h1>
          <p className="text-xl text-white/90">
            Aqui você encontra o melhor sistema de gestão de agendamentos de
            serviço!
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
          <div className="flex items-center justify-center lg:hidden mb-6"></div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Entre na sua conta</h2>
            <p className="text-sm text-gray-600 mt-1">
              Faça login para acessar o sistema
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Seu e-mail
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-3 py-2 border rounded-md bg-[#FFFFF0] focus:outline-none focus:ring-2 focus:ring-[#4169E1] ${
                    senha !== "" ? "border-[#4169E1]" : "border-gray-300"
                  }`}
                  value={senha}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link
                  to="/esqueci-senha"
                  className="text-sm text-[#4169E1] hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#4169E1] hover:bg-[#3154B3] text-white font-bold rounded-md transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Ou</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full mb-2 py-2 px-4 border border-gray-300 rounded-md flex items-center justify-center space-x-2 hover:bg-gray-50 transition duration-300"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Entre com sua conta Google</span>
            </button>

            <button
              type="button"
              className="w-full py-2 px-4 border border-gray-300 rounded-md flex items-center justify-center space-x-2 hover:bg-gray-50 transition duration-300"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
                  fill="black"
                />
              </svg>
              <span>Entre com sua conta Apple</span>
            </button>

            <div className="text-center text-sm mt-6">
              <span className="text-gray-600">
                Ainda não possui uma conta?{" "}
              </span>
              <Link to="/registro" className="text-[#4169E1] hover:underline">
                Criar conta
              </Link>
            </div>

            <p className="text-xs text-center text-gray-500 mt-8">
              Utilizamos cookies para melhorar sua experiência em nossos
              serviços. Ao realizar seu login, consideramos que você aceita esta
              utilização. Para mais informações, acesse nossa{" "}
              <Link
                to="/privacidade"
                className="text-[#4169E1] hover:underline"
              >
                Política de Privacidade
              </Link>
              .
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
