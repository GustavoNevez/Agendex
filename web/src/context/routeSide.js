import React, { createContext, useContext, useState } from 'react';

const RouteContext = createContext();

export const RouteProvider = ({ children }) => {
  const [currentPath, setCurrentPath] = useState('/');

  return (
    <RouteContext.Provider value={{ currentPath, setCurrentPath }}>
      {children}
    </RouteContext.Provider>
  );
};

export const useRoute = () => useContext(RouteContext);