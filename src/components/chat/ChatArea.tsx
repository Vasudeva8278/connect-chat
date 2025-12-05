import { useState, useRef, useEffect } from 'react';
import { User, Message } from '@/types/chat';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ChatAreaProps {
  selectedUser: User | null;
  currentUser: User | null;
  messages: Message[];
  onSendMessage: (message: string) => Promise<{ success: boolean }>;
}

export function ChatArea({
  selectedUser,
  currentUser,
  messages,
  onSendMessage,
}: ChatAreaProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedUser || isSending) return;
    
    setIsSending(true);
    const message = inputValue.trim();
    setInputValue('');
    
    await onSendMessage(message);
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSenderId = (senderId: string | { _id: string }) => {
    return typeof senderId === 'string' ? senderId : senderId._id;
  };

  const getSenderName = (msg: Message) => {
    if (typeof msg.senderId === 'object') {
      return msg.senderId.name || msg.senderId.moblieNumber || 'Unknown';
    }
    if (msg.senderId === currentUser?._id) {
      return currentUser?.name || currentUser?.moblieNumber || 'You';
    }
    return selectedUser?.name || selectedUser?.moblieNumber || 'Unknown';
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-chat-bg chat-pattern">
        <div className="text-center p-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-12 h-12 text-primary/50" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Welcome to Chat
          </h2>
          <p className="text-muted-foreground max-w-sm">
            Select a user from the sidebar to start a conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-primary px-6 py-4 flex items-center gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground font-semibold">
          {(selectedUser.name || selectedUser.moblieNumber).charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-semibold text-primary-foreground">
            {selectedUser.name || selectedUser.moblieNumber}
          </h2>
          <p className="text-sm text-primary-foreground/70">
            {selectedUser.moblieNumber}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-chat-bg chat-pattern custom-scrollbar space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground bg-card/80 backdrop-blur px-4 py-2 rounded-full text-sm">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = getSenderId(msg.senderId) === currentUser?._id;
            return (
              <div
                key={msg._id || index}
                className={cn(
                  'flex message-animate',
                  isOwn ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[70%] px-4 py-2 rounded-xl shadow-sm',
                    isOwn
                      ? 'bg-chat-sent rounded-br-sm'
                      : 'bg-chat-received rounded-bl-sm'
                  )}
                >
                  <p className="text-xs font-medium text-primary/70 mb-1">
                    {isOwn ? 'You' : getSenderName(msg)}
                  </p>
                  <p className="text-foreground break-words">{msg.message}</p>
                  <p className="text-[10px] text-muted-foreground text-right mt-1">
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-muted border-t border-border">
        <div className="flex gap-3 items-center max-w-4xl mx-auto">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 h-12 rounded-full px-5 bg-background border-0 shadow-sm"
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            size="icon"
            className="w-12 h-12 rounded-full shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
