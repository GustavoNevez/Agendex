import React from "react";
import { useHistory } from "react-router-dom";

const NotFound = () => {
  const history = useHistory();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <h1
        style={{
          fontSize: "8rem",
          margin: 0,
          color: "#dc3545",
        }}
      >
        404
      </h1>

      <h2
        style={{
          fontSize: "2rem",
          marginBottom: "1rem",
          color: "#343a40",
        }}
      >
        Página não encontrada
      </h2>

      <p
        style={{
          fontSize: "1.2rem",
          color: "#6c757d",
          marginBottom: "2rem",
        }}
      >
        A página que você está procurando não existe.
      </p>

      <button
        onClick={() => history.push("/")}
        style={{
          padding: "12px 24px",
          fontSize: "1.1rem",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
      >
        Voltar para a página inicial
      </button>
    </div>
  );
};

export default NotFound;
