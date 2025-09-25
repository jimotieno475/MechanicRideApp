// File: src/contexts/UserContext.js
import React, { createContext, useState, useContext } from "react";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  // You can store both user and mechanic
  const [user, setUser] = useState(null);        // for regular user
  const [mechanic, setMechanic] = useState(null); // for logged-in mechanic

  return (
    <UserContext.Provider value={{ user, setUser, mechanic, setMechanic }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

