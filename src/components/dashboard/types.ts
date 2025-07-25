import { User } from "@/types";
import { UserOrganization, UserStats } from "@/lib/profileApiSimple";

export interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export interface NotificationState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
  user: User;
  profileTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  userProfile: User | null;
  userOrganizations: UserOrganization[];
  userStats: UserStats | null;
  profileLoading: boolean;
  newPassword: string;
  confirmPassword: string;
  currentPassword: string;
  onPasswordChange: (field: string, value: string) => void;
  onSubmitPasswordChange: () => void;
  onDeleteOrganization: (orgId: string) => void;
}

export interface CreateOrganizationDialogProps {
  open: boolean;
  onClose: () => void;
  newOrgName: string;
  onNameChange: (name: string) => void;
  creating: boolean;
  onSubmit: () => void;
}

export interface NotificationSnackbarProps {
  notification: NotificationState;
  onClose: () => void;
}

export interface OrganizationsSectionProps {
  userOrganizations: UserOrganization[];
  onCreateClick: () => void;
  onOrganizationClick: (orgId: string) => void;
}
