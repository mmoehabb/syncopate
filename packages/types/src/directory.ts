export type DirectoryEntryType = "Workspace" | "Board" | "Task";

export interface DirectoryEntry {
  id: string;
  name: string; // The display name or title
  title?: string; // Optional title, mainly for Tasks
  status?: string; // Optional status, mainly for Tasks
  type: DirectoryEntryType;
}

export interface DirectoryResponse {
  path: string;
  type: "Root" | "Workspace" | "Board" | "Task"; // The type of the current directory
  id?: string; // The ID of the current directory entity, if applicable
  entries: DirectoryEntry[];
  hasMoreByStatus?: Record<string, boolean>; // Used to indicate if a status group has more items
}
