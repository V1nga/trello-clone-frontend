import type { components } from "./api";

export type User = components["schemas"]["UserResponse"];

export type Board = Omit<components["schemas"]["BoardResponse"], "description"> & {
  description: string | null;
};

export type BoardRole = "VIEWER" | "EDITOR";
export type BoardMemberRole = components["schemas"]["BoardMemberResponse"]["role"];
export type BoardMember = components["schemas"]["BoardMemberResponse"];

export type Column = components["schemas"]["ColumnResponse"];

export type Label = components["schemas"]["LabelResponse"];

export type CardSummary = Omit<components["schemas"]["CardSummaryResponse"], "dueDate"> & {
  dueDate: string | null;
};

export type ChecklistItem = components["schemas"]["ChecklistItemResponse"];
export type Checklist = components["schemas"]["ChecklistResponse"];

export type Attachment = Omit<components["schemas"]["AttachmentResponse"], "contentType"> & {
  contentType: string | null;
};

export type CardDetail = Omit<
  components["schemas"]["CardDetailResponse"],
  "description" | "dueDate" | "attachments"
> & {
  description: string | null;
  dueDate: string | null;
  attachments: Attachment[];
};

export type Comment = components["schemas"]["CommentResponse"];

export type AuthSession = components["schemas"]["AuthResponse"];

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  timestamp: string;
}
