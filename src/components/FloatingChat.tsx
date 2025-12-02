import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      // Handle message send logic here
      console.log("Message sent:", message);
      setMessage("");
    }
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-2xl hover:scale-110 transition-transform duration-200 flex items-center justify-center"
      >
        {isOpen ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-28 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-background rounded-2xl shadow-2xl border border-border overflow-hidden animate-scale-in">
          <div className="bg-gradient-to-r from-primary to-accent p-4 text-primary-foreground">
            <h3 className="font-bold text-lg">Chat with Us</h3>
            <p className="text-sm text-primary-foreground/90">We're here to help!</p>
          </div>
          
          <div className="p-4 h-80 overflow-y-auto bg-muted/20">
            <div className="space-y-4">
              <div className="bg-background p-3 rounded-lg shadow-sm">
                <p className="text-sm text-foreground">
                  Hello! How can we help you today?
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-border bg-background">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button 
                onClick={handleSend}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChat;
