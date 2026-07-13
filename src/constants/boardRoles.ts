import type { BoardMemberRole, BoardRole } from "@/types/models";

export const BOARD_ROLE_LABELS: Record<BoardMemberRole, string> = {
  OWNER: "Владелец",
  EDITOR: "Редактирование",
  VIEWER: "Просмотр",
};

export const INVITABLE_ROLE_OPTIONS: Array<{ title: string; value: BoardRole }> = [
  { title: BOARD_ROLE_LABELS.VIEWER, value: "VIEWER" },
  { title: BOARD_ROLE_LABELS.EDITOR, value: "EDITOR" },
];
