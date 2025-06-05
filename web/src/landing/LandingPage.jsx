import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/agendex-preto-Photoroom.png";

const features = [
  {
    title: "Gestão de Agendamentos",
    desc: "Organize seus horários e evite conflitos com uma agenda inteligente.",
    icon: "📅",
  },
  {
    title: "Notificações Automáticas",
    desc: "Envie lembretes para seus clientes por WhatsApp e e-mail.",
    icon: "🔔",
  },
  {
    title: "Controle de Profissionais",
    desc: "Gerencie sua equipe, serviços e disponibilidade em tempo real.",
    icon: "👨‍💼",
  },
  {
    title: "Links Personalizados",
    desc: "Divulgue seu negócio com links exclusivos para agendamento online.",
    icon: "🔗",
  },
];

const LandingPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-100 flex flex-col">
    <header className="flex items-center justify-between px-6 bg-white shadow h-20 overflow-hidden">
      <div className="flex items-center gap-2 h-full"></div>
      <nav className="hidden md:flex gap-6">
        <a
          href="#features"
          className="text-blue-700 font-medium hover:underline"
        >
          Funcionalidades
        </a>
        <a href="#precos" className="text-blue-700 font-medium hover:underline">
          Preços
        </a>
        <a
          href="#contato"
          className="text-blue-700 font-medium hover:underline"
        >
          Contato
        </a>
      </nav>
      <Link
        to="/login"
        className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
      >
        Entrar
      </Link>
    </header>
    <main className="flex-1 flex flex-col items-center justify-center px-4">
      <section className="max-w-3xl text-center mt-12 mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4">
          O sistema de agendamento{" "}
          <span className="text-violet-600">ideal</span> para o seu negócio
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          Simplifique sua rotina, aumente sua produtividade e ofereça a melhor
          experiência para seus clientes com o AgendeX.
        </p>
        <a
          href="/registro"
          className="inline-block bg-violet-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-violet-700 transition"
        >
          Experimente Grátis
        </a>
      </section>
      <section
        id="features"
        className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-20"
      >
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center border border-violet-100"
          >
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-lg text-blue-700 mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </section>
      <section id="precos" className="w-full max-w-3xl mb-20">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">
          Planos e Preços
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100 flex flex-col items-center">
            <span className="font-bold text-blue-600 text-lg mb-2">Grátis</span>
            <span className="text-3xl font-extrabold mb-2">R$0</span>
            <ul className="text-gray-600 mb-4 text-sm">
              <li>1 usuário</li>
              <li>Agenda básica</li>
              <li>Suporte por e-mail</li>
            </ul>
            <a
              href="/registro"
              className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
            >
              Começar
            </a>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-2 border-violet-400 flex flex-col items-center scale-105">
            <span className="font-bold text-violet-600 text-lg mb-2">
              Profissional
            </span>
            <span className="text-3xl font-extrabold mb-2">
              R$39<span className="text-base font-normal">/mês</span>
            </span>
            <ul className="text-gray-600 mb-4 text-sm">
              <li>Até 5 profissionais</li>
              <li>Notificações automáticas</li>
              <li>Links personalizados</li>
              <li>Suporte prioritário</li>
            </ul>
            <a
              href="/registro"
              className="bg-violet-600 text-white px-4 py-2 rounded font-semibold hover:bg-violet-700 transition"
            >
              Assinar
            </a>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100 flex flex-col items-center">
            <span className="font-bold text-blue-600 text-lg mb-2">
              Empresarial
            </span>
            <span className="text-3xl font-extrabold mb-2">
              R$99<span className="text-base font-normal">/mês</span>
            </span>
            <ul className="text-gray-600 mb-4 text-sm">
              <li>Profissionais ilimitados</li>
              <li>Relatórios avançados</li>
              <li>Integração WhatsApp</li>
              <li>Suporte VIP</li>
            </ul>
            <a
              href="/registro"
              className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
            >
              Assinar
            </a>
          </div>
        </div>
      </section>
      <section id="contato" className="w-full max-w-2xl mb-20 text-center">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">Fale Conosco</h2>
        <p className="text-gray-700 mb-4">
          Dúvidas? Suporte? Sugestões? Fale com a gente pelo WhatsApp!
        </p>
        <a
          href="https://wa.me/5542999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-green-600 transition"
        >
          WhatsApp
        </a>
      </section>
    </main>
    <footer className="bg-white border-t border-gray-100 py-6 text-center text-gray-500 text-sm">
      © {new Date().getFullYear()} AgendeX. Todos os direitos reservados.
    </footer>
  </div>
);

export default LandingPage;
