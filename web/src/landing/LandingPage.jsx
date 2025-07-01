import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Gestão de Agendamentos",
    desc: "Organize seus horários e evite conflitos com uma agenda inteligente que se adapta ao seu negócio.",
    icon: "📅",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Notificações Automáticas",
    desc: "Envie lembretes personalizados para seus clientes por WhatsApp e e-mail automaticamente.",
    icon: "🔔",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Controle de Profissionais",
    desc: "Gerencie sua equipe, serviços e disponibilidade em tempo real com dashboards intuitivos.",
    icon: "👨‍💼",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Links Personalizados",
    desc: "Divulgue seu negócio com links exclusivos e páginas de agendamento totalmente customizáveis.",
    icon: "🔗",
    gradient: "from-orange-500 to-red-500",
  },
];

const testimonials = [
  {
    name: "Maria Silva",
    role: "Proprietária - Salão de Beleza",
    text: "O AgendeX revolucionou meu negócio! Reduzi 80% das faltas e aumentei minha receita.",
    avatar: "👩‍💼",
  },
  {
    name: "Carlos Santos",
    role: "Clínica Médica",
    text: "Interface intuitiva e suporte excepcional. Recomendo para qualquer profissional da saúde.",
    avatar: "👨‍⚕️",
  },
  {
    name: "Ana Costa",
    role: "Personal Trainer",
    text: "Meus clientes adoram a facilidade de agendar. Nunca mais perdi um horário!",
    avatar: "👩‍🏫",
  },
];

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = [
        "home",
        "features",
        "precos",
        "testimonials",
        "contato",
      ];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AgendeX
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { id: "home", label: "Início" },
              { id: "features", label: "Funcionalidades" },
              { id: "precos", label: "Preços" },
              { id: "testimonials", label: "Depoimentos" },
              { id: "contato", label: "Contato" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  activeSection === item.id
                    ? "text-blue-600"
                    : isScrolled
                    ? "text-slate-700 hover:text-blue-600"
                    : "text-slate-600 hover:text-blue-600"
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          <Link
            to="/login"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section
          id="home"
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
          <div
            className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute bottom-40 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
            style={{ animationDelay: "4s" }}
          />

          <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  O futuro dos
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  agendamentos
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Transforme sua agenda em uma máquina de crescimento.
                <span className="text-blue-600 font-semibold">
                  {" "}
                  Automatize, organize e surpreenda
                </span>{" "}
                seus clientes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="/registro"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3"
                >
                  <span>Começar Gratuitamente</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </a>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-slate-700 px-8 py-4 rounded-2xl font-semibold hover:bg-white/50 transition-all duration-200 flex items-center gap-2"
                >
                  <span>Ver Demonstração</span>
                  <span>🎬</span>
                </button>
              </div>

              <div className="mt-16 flex items-center justify-center gap-8 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>14 dias grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Suporte premium</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Recursos que{" "}
                <span className="text-blue-600">fazem a diferença</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Cada funcionalidade foi pensada para simplificar sua rotina e
                potencializar seus resultados
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-blue-200 hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 text-2xl shadow-lg`}
                    >
                      {feature.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-slate-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section
          id="precos"
          className="py-24 bg-gradient-to-br from-slate-50 to-blue-50"
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Planos para{" "}
                <span className="text-purple-600">todos os tamanhos</span>
              </h2>
              <p className="text-xl text-slate-600">
                Escolha o plano ideal para o seu negócio e comece a crescer hoje
                mesmo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Plano Grátis */}
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full mb-6">
                    <span className="text-sm font-semibold text-slate-700">
                      Grátis
                    </span>
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-slate-900">
                      R$0
                    </span>
                    <span className="text-slate-500">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-600">1 usuário</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-600">Agenda básica</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-600">Suporte por e-mail</span>
                  </li>
                </ul>

                <a
                  href="/registro"
                  className="block w-full bg-slate-900 text-white text-center py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                >
                  Começar Agora
                </a>
              </div>

              {/* Plano Profissional */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-purple-200 relative transform scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Mais Popular
                  </span>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-6">
                    <span className="text-sm font-semibold text-purple-700">
                      Profissional
                    </span>
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-slate-900">
                      R$39
                    </span>
                    <span className="text-slate-500">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-600">Até 5 profissionais</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-600">
                      Notificações automáticas
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-600">Links personalizados</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-600">Suporte prioritário</span>
                  </li>
                </ul>

                <a
                  href="/registro"
                  className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Assinar Agora
                </a>
              </div>

              {/* Plano Empresarial */}
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-6">
                    <span className="text-sm font-semibold text-blue-700">
                      Empresarial
                    </span>
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-slate-900">
                      R$99
                    </span>
                    <span className="text-slate-500">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-600">
                      Profissionais ilimitados
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-600">Relatórios avançados</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-600">Integração WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-600">Suporte VIP</span>
                  </li>
                </ul>

                <a
                  href="/registro"
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Assinar Agora
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                O que nossos{" "}
                <span className="text-green-600">clientes dizem</span>
              </h2>
              <p className="text-xl text-slate-600">
                Histórias reais de transformação e crescimento
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-700 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>

                  <div className="flex text-yellow-400 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>⭐</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          id="contato"
          className="py-24 bg-gradient-to-br from-blue-900 to-purple-900 text-white"
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto para <span className="text-blue-300">revolucionar</span>{" "}
              seu negócio?
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Junte-se a milhares de profissionais que já transformaram suas
              agendas com o AgendeX
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <a
                href="/registro"
                className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Começar Gratuitamente
              </a>
              <a
                href="https://wa.me/5542999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-green-600 hover:scale-105 transition-all duration-200 flex items-center gap-3"
              >
                <span>💬</span>
                <span>Falar no WhatsApp</span>
              </a>
            </div>

            <div className="text-blue-200 text-sm">
              Tem dúvidas? Nossa equipe está pronta para ajudar você!
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-2xl font-bold">AgendeX</span>
            </div>

            <div className="text-slate-400 text-sm">
              © {new Date().getFullYear()} AgendeX. Todos os direitos
              reservados.
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
