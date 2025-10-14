import { create } from "zustand";

type User = {
  userName: string;
  isLoggedIn: boolean;
};

export const userUserStore = create((set) => ({
  user: null,
  setUser: (_user: User) => {
    set({ user: _user });
  },
}));
