import { UserStatus } from "@chess-blog-post/common";

export const getStatusColor = (userStatus: UserStatus): string => {
  switch (userStatus) {
    case UserStatus.Waiting:
      return "yellow";
    case UserStatus.Pending:
      return "green";
    case UserStatus.PairedPlayer:
    case UserStatus.PairedWatcher:
      return "red";
    default:
      return "slate";
  }
};
