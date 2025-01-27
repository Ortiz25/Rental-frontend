import { create } from 'zustand'





const currentYear = new Date().getFullYear()

export const useStore = create((set) => ({
  currentYear:currentYear.toString(),
  updateYear: (value) => set({ currentYear: value }),
  isSidebarCollapsed: false,
  setIsSidebarCollapsed: (value) => set({ isSidebarCollapsed: value }),
  role: "employee",
  changeRole: (value) => set({ role: value }),
  userName: {},
  changeUser: (value) => set({ userName: value }),
}));

export const generatePassword = (length = 8) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};
