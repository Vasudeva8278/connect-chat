import { User } from '@/types/chat';
import { Users, LogOut, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UsersSidebarProps {
  users: User[];
  currentUser: User | null;
  selectedUser: User | null;
  isConnected: boolean;
  onSelectUser: (user: User) => void;
  onLogout: () => void;
}

export function UsersSidebar({
  users,
  currentUser,
  selectedUser,
  isConnected,
  onSelectUser,
  onLogout,
}: UsersSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="bg-primary px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-primary-foreground">Chats</h2>
            <p className="text-xs text-primary-foreground/70">
              {currentUser?.name || currentUser?.moblieNumber}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      {/* Connection Status */}
      <div
        className={cn(
          'px-4 py-2 flex items-center gap-2 text-sm border-b',
          isConnected
            ? 'bg-status-online/10 text-status-online'
            : 'bg-status-offline/10 text-status-offline'
        )}
      >
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 pulse-animate" />
            <span>Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Disconnected</span>
          </>
        )}
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
            <Users className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">No users available</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {users.map((user) => (
              <li
                key={user._id}
                onClick={() => onSelectUser(user)}
                className={cn(
                  'px-4 py-3 cursor-pointer transition-colors hover:bg-sidebar-accent',
                  selectedUser?._id === user._id &&
                    'bg-sidebar-accent border-l-4 border-l-primary'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                    {(user.name || user.moblieNumber).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sidebar-foreground truncate">
                      {user.name || user.moblieNumber}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.moblieNumber}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
