import { useEffect } from 'react';

const CHATS_STORAGE_KEY = 'chat_list';
const ACTIVE_CHAT_ID_KEY = 'active_chat_id';

export function useChatStorage(chats, setChats, activeChatId, setActiveChatId, CHAT_RETENTION_MS) {
  // Load chats from localStorage on mount and clean up expired chats
  useEffect(() => {
    const loadChats = () => {
      try {
        const stored = localStorage.getItem(CHATS_STORAGE_KEY);
        if (stored) {
          const parsedChats = JSON.parse(stored);
          const now = Date.now();
          
          const validChats = parsedChats.filter(chat => {
            const chatAge = now - chat.createdAt;
            return chatAge < CHAT_RETENTION_MS;
          });
          
          if (validChats.length > 0) {
            setChats(validChats);
            
            const storedActiveChatId = localStorage.getItem(ACTIVE_CHAT_ID_KEY);
            if (storedActiveChatId) {
              const activeChatIdNum = Number(storedActiveChatId);
              if (validChats.some(chat => chat.id === activeChatIdNum)) {
                setActiveChatId(activeChatIdNum);
              } else {
                localStorage.removeItem(ACTIVE_CHAT_ID_KEY);
              }
            }
          }
          
          if (validChats.length !== parsedChats.length) {
            localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(validChats));
          }
        }
      } catch (error) {
        console.error('Error loading chats from localStorage:', error);
      }
    };
    
    loadChats();
  }, [setChats, setActiveChatId, CHAT_RETENTION_MS]);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      try {
        localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
      } catch (error) {
        console.error('Error saving chats to localStorage:', error);
      }
    }
  }, [chats]);

  // Save active chat ID to localStorage whenever it changes
  useEffect(() => {
    if (activeChatId !== null) {
      localStorage.setItem(ACTIVE_CHAT_ID_KEY, String(activeChatId));
    } else {
      localStorage.removeItem(ACTIVE_CHAT_ID_KEY);
    }
  }, [activeChatId]);

  // Set up interval to check for expired chats every hour
  useEffect(() => {
    const checkExpiredChats = () => {
      const now = Date.now();
      setChats(prevChats => {
        const validChats = prevChats.filter(chat => {
          const chatAge = now - chat.createdAt;
          return chatAge < CHAT_RETENTION_MS;
        });
        
        if (validChats.length !== prevChats.length) {
          if (validChats.length > 0) {
            localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(validChats));
            
            setActiveChatId(prevActiveId => {
              if (prevActiveId && !validChats.some(chat => chat.id === prevActiveId)) {
                localStorage.removeItem(ACTIVE_CHAT_ID_KEY);
                return null;
              }
              return prevActiveId;
            });
          } else {
            localStorage.removeItem(CHATS_STORAGE_KEY);
            localStorage.removeItem(ACTIVE_CHAT_ID_KEY);
            setActiveChatId(null);
          }
        }
        
        return validChats;
      });
    };
    
    const intervalId = setInterval(checkExpiredChats, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [setChats, setActiveChatId, CHAT_RETENTION_MS]);
}
