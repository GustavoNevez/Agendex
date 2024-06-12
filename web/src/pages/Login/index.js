import { Link } from "react-router-dom";
import { useState,useContext } from "react";
import { LayoutComponents } from "../../components/Register";
import { AuthContext } from "../../context/auth";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setPassword] = useState("");
  const { signIn, signed } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      email,
      senha
    };
    await signIn(data);
  };
  
  if (!signed) {
    return (
      <LayoutComponents>
        <form onSubmit={handleSubmit} className="login-form">
          <span className="login-form-title"> Entre na sua conta </span>
          <div className="wrap-input">
            <input
              className={email !== "" ? "has-val input" : "input"}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className="focus-input" data-placeholder="Email"></span>
          </div>

          <div className="wrap-input">
            <input
              className={senha !== "" ? "has-val input" : "input"}
              type="password"
              value={senha}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="focus-input" data-placeholder="Senha"></span>
          </div>

          <div className="container-login-form-btn">
            <button type="submit" className="login-form-btn">
              Login
            </button>
          </div>

          <div className="text-center">
            <span className="txt1">Não possui conta? </span>
            <Link className="txt2" to="/registro">
              Criar conta.
            </Link>
          </div>
        </form>
      </LayoutComponents>
    );
  } else {
    return <Redirect to="/agendamentos" />;
  }
};

export default Login;