import { createContext, useContext, useState } from 'react';

const RoleContext = createContext(null);

const ROLES = ['Employee', 'Manager', 'Compliance Manager', 'Auditor'];

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('cos_role') || 'Compliance Manager');

  function changeRole(r) {
    localStorage.setItem('cos_role', r);
    setRole(r);
  }

  return (
    <RoleContext.Provider value={{ role, setRole: changeRole, roles: ROLES }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}

export { ROLES };
