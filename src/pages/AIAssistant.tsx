import React from 'react';
import { AIChat } from '@/components/AIChat';

const AIAssistant = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
          <p className="text-muted-foreground">
            Chat with AI na may real-time search functionality
          </p>
        </div>
        <AIChat />
      </main>
    </div>
  );
};

export default AIAssistant;