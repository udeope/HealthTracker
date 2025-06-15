'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Send,
  Paperclip,
  Image,
  FileText,
  Download,
  Eye,
  Lock,
  Shield,
  Clock,
  CheckCheck,
  MoreVertical,
  Phone,
  Video,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TelemedicineService, NotificationService, type ChatMessage, type ChatRoom, type Doctor, type Consultation } from '@/lib/telemedicine-system';

interface ChatInterfaceProps {
  consultation: Consultation;
  doctor: Doctor;
  isDoctor?: boolean;
}

export function ChatInterface({ consultation, doctor, isDoctor = false }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const currentUserId = isDoctor ? consultation.doctor_id : consultation.patient_id;
  const otherUserId = isDoctor ? consultation.patient_id : consultation.doctor_id;

  useEffect(() => {
    initializeChat();
    
    // Configurar notificaciones en tiempo real
    if (consultation.chat_room_id) {
      NotificationService.subscribeToMessages(consultation.chat_room_id, handleNewMessage);
    }

    return () => {
      // Cleanup
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Simular indicador de "escribiendo..."
    if (isTyping) {
      NotificationService.sendTypingIndicator(consultation.chat_room_id || '', true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        NotificationService.sendTypingIndicator(consultation.chat_room_id || '', false);
      }, 1000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      
      if (consultation.chat_room_id) {
        // Cargar mensajes existentes
        const chatMessages = await TelemedicineService.getChatMessages(consultation.chat_room_id);
        setMessages(chatMessages);
        
        // Marcar mensajes como leídos
        await TelemedicineService.markMessagesAsRead(consultation.chat_room_id, currentUserId);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Error al cargar el chat');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
    
    // Marcar como leído si no es nuestro mensaje
    if (message.sender_id !== currentUserId && consultation.chat_room_id) {
      TelemedicineService.markMessagesAsRead(consultation.chat_room_id, currentUserId);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !consultation.chat_room_id) return;

    try {
      const messageData = {
        chat_room_id: consultation.chat_room_id,
        sender_id: currentUserId,
        sender_type: isDoctor ? 'doctor' as const : 'patient' as const,
        message_type: 'text' as const,
        content: newMessage.trim(),
        is_encrypted: true,
        is_deleted: false
      };

      await TelemedicineService.sendMessage(messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setIsTyping(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setIsFileDialogOpen(true);
    }
  };

  const sendFile = async () => {
    if (!selectedFile || !consultation.chat_room_id) return;

    try {
      setLoading(true);
      
      // En producción, esto subiría el archivo a un servidor
      const fileUrl = URL.createObjectURL(selectedFile);
      
      const messageData = {
        chat_room_id: consultation.chat_room_id,
        sender_id: currentUserId,
        sender_type: isDoctor ? 'doctor' as const : 'patient' as const,
        message_type: selectedFile.type.startsWith('image/') ? 'image' as const : 'file' as const,
        content: selectedFile.name,
        file_url: fileUrl,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        is_encrypted: true,
        is_deleted: false
      };

      await TelemedicineService.sendMessage(messageData);
      setIsFileDialogOpen(false);
      setSelectedFile(null);
      toast.success('Archivo enviado');
    } catch (error) {
      console.error('Error sending file:', error);
      toast.error('Error al enviar el archivo');
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isCurrentUser = message.sender_id === currentUserId;
    const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;
    const messageTime = new Date(message.created_at);

    return (
      <div
        key={message.id}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        {!isCurrentUser && showAvatar && (
          <Avatar className="w-8 h-8 mr-2">
            <AvatarImage src={doctor.profile_image} />
            <AvatarFallback>{doctor.first_name[0]}{doctor.last_name[0]}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`max-w-[70%] ${!isCurrentUser && !showAvatar ? 'ml-10' : ''}`}>
          {message.message_type === 'text' && (
            <div className={`p-3 rounded-lg ${
              isCurrentUser 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
              <p>{message.content}</p>
            </div>
          )}

          {message.message_type === 'image' && (
            <div className={`p-2 rounded-lg ${
              isCurrentUser 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
              <img 
                src={message.file_url} 
                alt={message.content} 
                className="rounded max-w-full max-h-64 object-contain"
              />
              <div className="flex items-center justify-between mt-2 text-xs">
                <span>{message.content}</span>
                <Download className="w-4 h-4" />
              </div>
            </div>
          )}

          {message.message_type === 'file' && (
            <div className={`p-3 rounded-lg ${
              isCurrentUser 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
              <div className="flex items-center space-x-2">
                <FileText className="w-8 h-8" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{message.content}</p>
                  <p className="text-xs opacity-70">
                    {message.file_size && formatFileSize(message.file_size)}
                  </p>
                </div>
                <Download className="w-4 h-4" />
              </div>
            </div>
          )}

          <div className={`flex items-center mt-1 text-xs text-muted-foreground ${
            isCurrentUser ? 'justify-end' : 'justify-start'
          }`}>
            <span>{format(messageTime, 'HH:mm')}</span>
            {isCurrentUser && message.is_read && (
              <CheckCheck className="w-3 h-3 ml-1 text-blue-500" />
            )}
          </div>
        </div>

        {isCurrentUser && showAvatar && (
          <Avatar className="w-8 h-8 ml-2">
            <AvatarFallback>YO</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={doctor.profile_image} />
            <AvatarFallback>{doctor.first_name[0]}{doctor.last_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">
              {isDoctor ? 'Paciente' : `${doctor.first_name} ${doctor.last_name}`}
            </h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-muted-foreground">
                {isOnline ? 'En línea' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message, index) => renderMessage(message, index))}
            {otherUserTyping && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm">Escribiendo...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No hay mensajes aún. Comienza la conversación.
            </p>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFileClick}
            className="text-muted-foreground"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFileClick}
            className="text-muted-foreground"
          >
            <Image className="w-5 h-5" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <Input
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-center mt-2">
          <Badge variant="outline" className="text-xs flex items-center space-x-1">
            <Lock className="w-3 h-3" />
            <span>Cifrado de extremo a extremo</span>
          </Badge>
        </div>
      </div>

      {/* File upload dialog */}
      <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Archivo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedFile && (
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {selectedFile.type.startsWith('image/') ? (
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <FileText className="w-16 h-16 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium truncate">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">Archivo seguro</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Este archivo será cifrado antes de enviarse y solo podrá ser visto por los participantes de esta consulta.
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsFileDialogOpen(false);
                  setSelectedFile(null);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={sendFile}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente de icono de mensaje
function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}