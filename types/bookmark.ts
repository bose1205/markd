export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  thumbnail: string;
  favicon: string;
  projectIds: string[];
  createdAt: number;
}
