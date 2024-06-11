import React, { useState, useEffect, useContext, createContext } from "react";
import { config } from "../config";

const LocalContext = createContext();

function LocalContextProvider({ children }) {
  const [currentActive, setCurrentActive] = useState(config.currentActive);

  useEffect(() => {
    const canvas = document.getElementById("canvas");

    function checkCurrentActive() {
      if (config.currentActive && config.currentActive !== currentActive) {
        setCurrentActive(config.currentActive);
      }
    }
    document.addEventListener("click", checkCurrentActive);
    return () => {
      document.removeEventListener("click", checkCurrentActive);
    };
  }, [currentActive]);

  return (
    <LocalContext.Provider value={{ currentActive, setCurrentActive }}>
      {children}
    </LocalContext.Provider>
  );
}

const useLocalContext = () => {
  return useContext(LocalContext);
};

export { useLocalContext, LocalContextProvider };
