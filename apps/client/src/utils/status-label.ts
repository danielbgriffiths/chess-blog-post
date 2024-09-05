import { UserStatus } from "@chess-blog-post/common";

export const getStatusLabel = (userStatus: UserStatus): string => {
  switch (userStatus) {
    case UserStatus.Waiting:
      return "Waiting";
    case UserStatus.Pending:
      return "Game Available";
    case UserStatus.PairedPlayer:
      return "Paired as Player";
    case UserStatus.PairedWatcher:
      return "Paired as Observer";
    default:
      return "Unknown";
  }
};
