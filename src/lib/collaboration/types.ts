export type ProjectRole = "owner" | "author" | "reviewer" | "translator" | "viewer";

export interface ProjectMember {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: ProjectRole;
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canPublish: boolean;
    canExport: boolean;
    canManageMembers: boolean;
    canDelete: boolean;
  };
  invitedAt: string;
  acceptedAt?: string;
}

export interface Comment {
  id: string;
  courseId: string;
  slideIndex: number;
  blockId?: string;
  position?: { x: number; y: number };
  author: { id: string; name: string; email: string; avatar?: string };
  content: string;
  mentions: string[];
  status: "open" | "resolved" | "wontfix";
  priority: "low" | "medium" | "high";
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  replies: {
    id: string;
    author: { id: string; name: string };
    content: string;
    createdAt: string;
  }[];
}

export interface CourseVersion {
  id: string;
  courseId: string;
  version: number;
  label?: string;
  snapshot: string;
  author: { id: string; name: string };
  createdAt: string;
  changesSummary: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "comment" | "mention" | "review_request" | "status_change" | "share";
  title: string;
  message: string;
  courseId: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export const ROLE_PERMISSIONS: Record<ProjectRole, ProjectMember["permissions"]> = {
  owner: {
    canEdit: true,
    canComment: true,
    canPublish: true,
    canExport: true,
    canManageMembers: true,
    canDelete: true,
  },
  author: {
    canEdit: true,
    canComment: true,
    canPublish: false,
    canExport: true,
    canManageMembers: false,
    canDelete: false,
  },
  reviewer: {
    canEdit: false,
    canComment: true,
    canPublish: false,
    canExport: false,
    canManageMembers: false,
    canDelete: false,
  },
  translator: {
    canEdit: true,
    canComment: true,
    canPublish: false,
    canExport: false,
    canManageMembers: false,
    canDelete: false,
  },
  viewer: {
    canEdit: false,
    canComment: false,
    canPublish: false,
    canExport: false,
    canManageMembers: false,
    canDelete: false,
  },
};
