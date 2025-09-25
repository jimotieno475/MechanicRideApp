// File: src/contexts/UserContext.js
import React, { createContext, useState, useContext } from "react";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  // Store user, mechanic, and admin separately
  const [user, setUser] = useState(null);        // for regular user
  const [mechanic, setMechanic] = useState(null); // for logged-in mechanic
  const [admin, setAdmin] = useState(null);      // for admin user

  return (
    <UserContext.Provider value={{ 
      user, setUser, 
      mechanic, setMechanic, 
      admin, setAdmin 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

