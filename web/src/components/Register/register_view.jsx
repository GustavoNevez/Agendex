import "./styles.css";
import teste from "../../assets/logo.png"

export const LayoutComponents = (props) => {
  return (
    <div className="container">
      <div className="left-section">
      <img src={teste} alt='teste' className="img-fluidd " />
        <div className="container-left">
          <div className="logo">
          
            <div className="container-content">
                <h1>Seja bem-vindo!</h1>
                <p>Aqui você encontra o melhor sistema de gestão para prestadores de serviço!</p>
              </div>
            </div>
        </div>
        
      </div>
      <div className="right-section">
        <div className="wrap-login">
          {props.children}
        </div>
      </div>
    </div>
  );
};