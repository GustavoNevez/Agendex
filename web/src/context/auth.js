import { createContext, useState, useEffect } from "react";
import Loading from "../components/Loading";
import api from "../services/api";
import { showSuccessToast, showErrorToast } from '../utils/notifications';
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";
export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const loadingStoredData = async () => {
            
            const storageUser = localStorage.getItem("@Auth:user");
            const storageToken = localStorage.getItem("@Auth:token");
    
            if(storageUser && storageToken) {
                try {
                    // Set the token in the headers for validation
                    api.defaults.headers.common["Authorization"] = `Bearer ${storageToken}`;
                    
                    // Validate the token with a simple request
                    // This will trigger the interceptor if the token is invalid
                    await api.get("/auth/validate-token");
                    
                    // If we get here, the token is valid
                    setUser(JSON.parse(storageUser));
                } catch (error) {
                    // If token validation fails, clear storage and don't set user
                    localStorage.removeItem("@Auth:token");
                    localStorage.removeItem("@Auth:user");
                    api.defaults.headers.common["Authorization"] = null;
                }
            }
            setLoading(false);
        };
        loadingStoredData();
    }, []);

    

    const signIn = async ({ email, senha }) => {
        try {
            const response = await api.post("/auth/auth", {
                email,
                senha
            });
            
            if (response.data.error) {
                showErrorToast(response.data.error);
            } else {
                setUser(response.data.user);
                api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
                localStorage.setItem("@Auth:token", response.data.token);
                localStorage.setItem("@Auth:user", JSON.stringify(response.data.user));
                showSuccessToast("Login realizado com sucesso!");
            }
        } catch (error) {
            if (error.response) { 
                showErrorToast(error.message);
            } else {
                showErrorToast("Ocorreu um erro ao realizar o login. Por favor, tente novamente.");
            }
        }
    }

    const signUp = async ({ nome, email, senha }) => {
        
        try {
          const response = await api.post("/auth/register", { nome, email, senha });
          if(response.data.error) {
            showErrorToast(response.data.error);
        } else {
            setUser(response.data.user);
            api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
           localStorage.setItem("@Auth:token", response.data.token);
           localStorage.setItem("@Auth:user", JSON.stringify(response.data.user));
           showSuccessToast("Registrado com sucesso!")
        }
        } catch (error) { 
            showErrorToast(error.message);
        }
      };

    const signOut = () => {
        localStorage.clear();
        setUser(null);
        return <Redirect to='/' />
    }

    return(
        <AuthContext.Provider value={{
            user,
            signed: !!user,
            signIn,
            signUp,
            signOut,
        }}>
            {!loading ? children : <Loading />}
        </AuthContext.Provider>
    )
}