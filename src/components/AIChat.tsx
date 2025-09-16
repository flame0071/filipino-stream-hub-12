import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Send, Bot, User, Search, Sparkles, Trash2, Image } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  hasSearchResults?: boolean;
  aiModel?: 'openai' | 'gemini';
  type?: 'text' | 'image';
  imageUrl?: string;
}

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [aiModel, setAiModel] = useState<'openai' | 'gemini'>('openai');
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const functionName = aiModel === 'gemini' ? 'gemini-chat' : 'ai-chat';

    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          message: userMessage.content,
          useSearch 
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        hasSearchResults: data.hasSearchResults,
        aiModel
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Generate image: ${imagePrompt.trim()}`,
      isUser: true,
      timestamp: new Date(),
      type: 'image'
    };

    setMessages(prev => [...prev, userMessage]);
    setImagePrompt('');
    setIsGeneratingImage(true);

    try {
      const { data, error } = await supabase.functions.invoke('image-generator', {
        body: { 
          prompt: imagePrompt.trim(),
          size: "1024x1024",
          quality: "standard"
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Generated image for: "${data.prompt}"`,
        isUser: false,
        timestamp: new Date(),
        type: 'image',
        imageUrl: data.imageUrl
      };

      setMessages(prev => [...prev, aiMessage]);
      toast({
        title: "Image generated",
        description: "Your image has been created successfully",
      });
    } catch (error: any) {
      console.error('Image generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate image",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    toast({
      title: "Chat cleared",
      description: "Chat history has been cleared",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateImage();
    }
  };

  return (
    <div className={`w-full mx-auto flex flex-col ${isMobile ? 'h-[calc(100vh-8rem)]' : 'h-[700px] max-w-4xl'}`}>
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Image Generator
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 mt-4">
          <Card className="flex-1 flex flex-col p-4 h-full">
        <div className={`flex items-center justify-between mb-4 ${isMobile ? 'flex-col gap-4' : ''}`}>
          <div className="flex items-center justify-between w-full">
            <h2 className={`font-semibold flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              <Bot className="w-5 h-5" />
              AI Assistant
            </h2>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={clearHistory}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {!isMobile && "Clear"}
              </Button>
            )}
          </div>
          
          <div className={`flex items-center gap-4 ${isMobile ? 'flex-col w-full gap-3' : ''}`}>
            <div className={`flex items-center space-x-2 ${isMobile ? 'w-full justify-between' : ''}`}>
              <Label htmlFor="ai-model" className="text-sm">Model:</Label>
              <Select value={aiModel} onValueChange={(value: 'openai' | 'gemini') => setAiModel(value)}>
                <SelectTrigger className={isMobile ? "w-24" : "w-32"}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai" className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    OpenAI
                  </SelectItem>
                  <SelectItem value="gemini" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Gemini
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={`flex items-center space-x-2 ${isMobile ? 'w-full justify-between' : ''}`}>
              <Switch
                id="search-mode"
                checked={useSearch}
                onCheckedChange={setUseSearch}
              />
              <Label htmlFor="search-mode" className="flex items-center gap-1">
                <Search className="w-4 h-4" />
                {isMobile ? "Search" : "Real-time Search"}
              </Label>
            </div>
          </div>
        </div>

        <ScrollArea ref={scrollAreaRef} className={`flex-1 ${isMobile ? 'pr-2' : 'pr-4'}`}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className={`text-center text-muted-foreground py-8 ${isMobile ? 'px-4' : ''}`}>
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className={isMobile ? 'text-sm' : ''}>Start a conversation with the AI assistant</p>
                <p className={`text-sm mt-2 ${isMobile ? 'text-xs' : ''}`}>Choose between OpenAI or Gemini and toggle real-time search for current information</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'} ${isMobile ? 'px-2' : ''}`}
              >
                <div className={`flex gap-3 ${isMobile ? 'max-w-[90%]' : 'max-w-[80%]'} ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isUser 
                      ? 'bg-primary text-primary-foreground' 
                      : message.aiModel === 'gemini'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {message.isUser ? <User className="w-4 h-4" /> : 
                      message.aiModel === 'gemini' ? <Sparkles className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  
                   <div className={`rounded-lg px-4 py-2 ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : message.aiModel === 'gemini'
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 border border-blue-200'
                        : 'bg-secondary text-secondary-foreground'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    {message.imageUrl && (
                      <div className="mt-3">
                        <img 
                          src={message.imageUrl} 
                          alt="Generated image" 
                          className="rounded-lg max-w-full h-auto"
                          style={{ maxHeight: '300px' }}
                        />
                      </div>
                    )}
                    {message.hasSearchResults && (
                      <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                        <Search className="w-3 h-3" />
                        <span>Included web search results</span>
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className={`flex gap-3 justify-start ${isMobile ? 'px-2' : ''}`}>
                <div className={`flex gap-3 ${isMobile ? 'max-w-[90%]' : 'max-w-[80%]'}`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-secondary text-secondary-foreground">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="rounded-lg px-4 py-2 bg-secondary text-secondary-foreground">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span className="text-sm">Thinking...</span>
                      {useSearch && (
                        <span className="text-xs opacity-70">(searching web with {aiModel})</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </TabsContent>

    <TabsContent value="image" className="flex-1 mt-4">
      <Card className="flex-1 flex flex-col p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-semibold flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            <Image className="w-5 h-5" />
            Image Generator
          </h2>
          {messages.filter(m => m.type === 'image').length > 0 && (
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={clearHistory}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {!isMobile && "Clear"}
            </Button>
          )}
        </div>

        <ScrollArea ref={scrollAreaRef} className={`flex-1 ${isMobile ? 'pr-2' : 'pr-4'}`}>
          <div className="space-y-4">
            {messages.filter(m => m.type === 'image').length === 0 && (
              <div className={`text-center text-muted-foreground py-8 ${isMobile ? 'px-4' : ''}`}>
                <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className={isMobile ? 'text-sm' : ''}>Generate images with AI</p>
                <p className={`text-sm mt-2 ${isMobile ? 'text-xs' : ''}`}>Describe what you want to see and AI will create it for you</p>
              </div>
            )}

            {messages.filter(m => m.type === 'image').map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'} ${isMobile ? 'px-2' : ''}`}
              >
                <div className={`flex gap-3 ${isMobile ? 'max-w-[90%]' : 'max-w-[80%]'} ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isUser 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-gradient-to-r from-pink-500 to-orange-500 text-white'
                  }`}>
                    {message.isUser ? <User className="w-4 h-4" /> : <Image className="w-4 h-4" />}
                  </div>
                  
                  <div className={`rounded-lg px-4 py-2 ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gradient-to-r from-pink-50 to-orange-50 text-gray-800 border border-pink-200'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    {message.imageUrl && (
                      <div className="mt-3">
                        <img 
                          src={message.imageUrl} 
                          alt="Generated image" 
                          className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                          style={{ maxHeight: '300px' }}
                          onClick={() => window.open(message.imageUrl, '_blank')}
                        />
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isGeneratingImage && (
              <div className={`flex gap-3 justify-start ${isMobile ? 'px-2' : ''}`}>
                <div className={`flex gap-3 ${isMobile ? 'max-w-[90%]' : 'max-w-[80%]'}`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-pink-500 to-orange-500 text-white">
                    <Image className="w-4 h-4" />
                  </div>
                  <div className="rounded-lg px-4 py-2 bg-gradient-to-r from-pink-50 to-orange-50 text-gray-800 border border-pink-200">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span className="text-sm">Generating image...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-4">
          <Input
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            onKeyPress={handleImageKeyPress}
            placeholder="Describe the image you want to generate..."
            disabled={isGeneratingImage}
            className="flex-1"
          />
          <Button 
            onClick={generateImage} 
            disabled={!imagePrompt.trim() || isGeneratingImage}
            size="icon"
          >
            <Image className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </TabsContent>
  </Tabs>
    </div>
  );
};