export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
}

export interface Project {
  id: string;
  name: string;
  initialPrompt: string;
  currentCode: string | null;
  currentVersionIndex: string;
  isPublished: boolean;
  isGenerating?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: string;
  content: string;
  timestamp: string;
}

export interface Version {
  id: string;
  code: string;
  description: string | null;
  timestamp: string;
}

export interface ProjectDetail extends Project {
  conversation: Message[];
  versions: Version[];
}

export interface CommunityProject {
  id: string;
  name: string;
  initialPrompt: string;
  currentCode: string | null;
  createdAt: string;
  user: { name: string };
}