import { Card } from "@/components/ui/card";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  if (message.role === 'system') return null;
  
  return (
    <Card 
      className={`p-3 ${
        message.role === 'assistant' 
          ? 'bg-secondary/50' 
          : 'bg-primary/10'
      }`}
    >
      <p className="text-sm">{message.content}</p>
    </Card>
  );
};

export default ChatMessage; 