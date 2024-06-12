import { Link,Redirect} from "react-router-dom";
import { useState, useContext } from "react";
import {LayoutComponents} from "../../components/Register";


import { AuthContext } from '../../context/auth';

export const Register = () => {
  const [email, setEmail] = useState("");
  const [senha, setPassword] = useState("");
  const [nome, setName] = useState("");
  const { signUp, signed } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      nome,
      email,
      senha,
    };
    await signUp(data);
    
  };
    
  if (!signed){
  
  return (
  
    <LayoutComponents>
      <form onSubmit={handleSubmit} className="login-form">
        <span className="login-form-title"> Criar Conta </span>

     

        <div className="wrap-input">
          <input
            className={nome !== "" ? "has-val input" : "input"}
            type="text"
            value={nome}
            onChange={(e) => setName(e.target.value)}
          />
          <span className="focus-input" data-placeholder="Nome"></span>
        </div>

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
            Criar Conta
          </button>
        </div>

        <div className="text-center">
          <span className="txt1">Já possui conta? </span>
          <Link className="txt2" to="/login">
            Acessar agora!
          </Link>
        </div>
      </form>
    </LayoutComponents>
  );
} else {
  return <Redirect to="/agendamentos" />;
}
};
export default Register;