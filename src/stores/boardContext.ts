import { defineStore } from "pinia";
import type { BoardMember } from "@/types/models";

interface BoardContextState {
  boardId: string | null;
  canEdit: boolean;
  members: BoardMember[];
  pendingCardId: string | null;
}

export const useBoardContextStore = defineStore("boardContext", {
  state: (): BoardContextState => ({
    boardId: null,
    canEdit: false,
    members: [],
    pendingCardId: null,
  }),

  actions: {
    setContext(boardId: string, canEdit: boolean, members: BoardMember[]) {
      this.boardId = boardId;
      this.canEdit = canEdit;
      this.members = members;
    },

    clearContext() {
      this.boardId = null;
      this.canEdit = false;
      this.members = [];
      this.pendingCardId = null;
    },

    requestOpenCard(cardId: string) {
      this.pendingCardId = cardId;
    },

    consumePendingCard(): string | null {
      const cardId = this.pendingCardId;
      this.pendingCardId = null;
      return cardId;
    },
  },
});
