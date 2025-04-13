import { useState } from "react";
import { AIService } from "../AIService";
import { ChatMessage } from "../types";
import { Network } from "@/types/network";

export function useAIChat(currentNetwork: Network | null) {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);

  const handleAIChatClick = () => {
    setIsAIChatOpen(true);
    
    // Add welcome message if chat is empty
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Hello! I'm your network assistant. I can help you enhance your ${currentNetwork?.name || 'network'} by suggesting new people, organizations, events, or venues to add. What would you like help with today?`,
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsAILoading(true);
    
    try {
      // Get AI response
      const aiResponse = await AIService.getResponse(currentMessage, currentNetwork?.name);
      
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      setChatMessages(prev => [
        ...prev, 
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsAILoading(false);
    }
  };

  const closeAIChat = () => setIsAIChatOpen(false);

  return {
    isAIChatOpen,
    setIsAIChatOpen,
    chatMessages,
    currentMessage,
    setCurrentMessage,
    isAILoading,
    handleAIChatClick,
    handleSendMessage,
    closeAIChat
  };
} 