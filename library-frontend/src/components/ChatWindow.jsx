import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Slide,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Close,
  Send,
  AutoStories,
  SmartToy,
  Person
} from '@mui/icons-material';
import chatService from '../api/chatService';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';

const ChatWindow = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user, isAuthenticated } = useAuthStore();

  // Load welcome message
  useEffect(() => {
    const savedMessages = sessionStorage.getItem('chatMessages');

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      const welcomeMessage = {
        id: Date.now(),
        role: 'assistant',
        content: isAuthenticated
          ? `Bonjour ${user?.username} ! Je suis l'assistant BiblioRA. Comment puis-je vous aider aujourd'hui ?`
          : `Bienvenue chez BiblioRA ! Je suis votre assistant virtuel. Comment puis-je vous aider à trouver des livres ?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isAuthenticated, user]);

  // Save messages
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(inputMessage);

      if (response.success && response.data) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    'Recommandez-moi un livre',
    'Durée d\'emprunt',
    'Comment emprunter ?'
  ];

  return (
    <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: { xs: 'calc(100% - 32px)', sm: 420 },
          height: { xs: 'calc(100vh - 100px)', sm: 600 },
          maxHeight: 'calc(100vh - 100px)',
          zIndex: 1000,
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 12px 48px rgba(120, 53, 15, 0.25)',
          border: '1px solid rgba(251, 191, 36, 0.2)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: '#78350f',
            color: '#fffbeb',
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: '#fffbeb',
              color: '#78350f',
              width: 40,
              height: 40,
            }}
          >
            <AutoStories />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              Assistant BiblioRA
            </Typography>
            <Typography variant="caption" sx={{ color: '#fcd34d', opacity: 0.9 }}>
              {isAuthenticated ? `Connecté: ${user?.username}` : 'Visiteur'}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: '#fffbeb',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            bgcolor: '#fdfbf7',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                gap: 1.5,
                alignItems: 'flex-start',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: message.role === 'user' ? '#78350f' : '#f5f5f4',
                  color: message.role === 'user' ? '#fffbeb' : '#78350f',
                  width: 32,
                  height: 32,
                }}
              >
                {message.role === 'user' ? <Person fontSize="small" /> : <SmartToy fontSize="small" />}
              </Avatar>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '75%',
                  bgcolor: message.role === 'user' ? '#78350f' : '#ffffff',
                  color: message.role === 'user' ? '#fffbeb' : '#292524',
                  borderRadius: 2,
                  borderBottomRightRadius: message.role === 'user' ? 0 : 2,
                  borderBottomLeftRadius: message.role === 'user' ? 2 : 0,
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
              </Paper>
            </Box>
          ))}

          {isLoading && (
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: '#f5f5f4', color: '#78350f', width: 32, height: 32 }}>
                <SmartToy fontSize="small" />
              </Avatar>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <CircularProgress size={20} sx={{ color: '#78350f' }} />
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <Box sx={{ px: 2, pb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Questions rapides :
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {quickActions.map((action, index) => (
                <Chip
                  key={index}
                  label={action}
                  size="small"
                  onClick={() => setInputMessage(action)}
                  sx={{
                    bgcolor: '#fef3c7',
                    color: '#78350f',
                    '&:hover': { bgcolor: '#fcd34d' },
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Input */}
        <Box sx={{ p: 2, bgcolor: '#ffffff', borderTop: '1px solid #e7e5e4' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tapez votre message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              multiline
              maxRows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#fdfbf7',
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              sx={{
                bgcolor: '#78350f',
                color: '#fffbeb',
                '&:hover': { bgcolor: '#92400e' },
                '&:disabled': {
                  bgcolor: '#e7e5e4',
                  color: '#a8a29e',
                },
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Slide>
  );
};

export default ChatWindow;
