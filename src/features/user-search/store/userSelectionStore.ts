import { create } from 'zustand';
import type { IasUser } from '@/types/scim';

interface UserSelectionState {
  selectedIds: Set<string>;
  selectedUsers: IasUser[];
  toggleUser: (user: IasUser) => void;
  selectAll: (users: IasUser[]) => void;
  clearSelection: () => void;
}

export const useUserSelectionStore = create<UserSelectionState>((set) => ({
  selectedIds: new Set(),
  selectedUsers: [],

  toggleUser(user) {
    set((state) => {
      const ids = new Set(state.selectedIds);
      const users = [...state.selectedUsers];
      if (ids.has(user.id)) {
        ids.delete(user.id);
        return { selectedIds: ids, selectedUsers: users.filter((u) => u.id !== user.id) };
      } else {
        ids.add(user.id);
        return { selectedIds: ids, selectedUsers: [...users, user] };
      }
    });
  },

  selectAll(users) {
    set({ selectedIds: new Set(users.map((u) => u.id)), selectedUsers: users });
  },

  clearSelection() {
    set({ selectedIds: new Set(), selectedUsers: [] });
  },
}));
