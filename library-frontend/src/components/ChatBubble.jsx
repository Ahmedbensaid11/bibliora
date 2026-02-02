import { useState } from 'react';
import { Fab, Zoom, Tooltip } from '@mui/material';
import { ChatBubbleOutline } from '@mui/icons-material';
import ChatWindow from './ChatWindow';

const ChatBubble = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <Zoom in={!isChatOpen}>
        <Tooltip title="Besoin d'aide ? Discutez avec BiblioRA" placement="left">
          <Fab
            color="primary"
            aria-label="chat"
            onClick={handleToggleChat}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
              bgcolor: '#78350f',
              width: 64,
              height: 64,
              boxShadow: '0 8px 24px rgba(120, 53, 15, 0.3)',
              '&:hover': {
                bgcolor: '#92400e',
                transform: 'scale(1.1)',
                boxShadow: '0 12px 32px rgba(120, 53, 15, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ChatBubbleOutline sx={{ fontSize: 28 }} />
          </Fab>
        </Tooltip>
      </Zoom>

      <ChatWindow isOpen={isChatOpen} onClose={handleToggleChat} />
    </>
  );
};

export default ChatBubble;
