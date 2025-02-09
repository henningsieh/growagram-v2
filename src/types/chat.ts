export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
}
