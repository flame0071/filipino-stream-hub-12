import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Facebook } from 'lucide-react';

export const PromoPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup every time the page loads
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-accent">
            ⊰DISCOUNTED PROMO LOAD FOR SMART &TNT⊱
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-background/50 rounded border border-border/50">
              <p className="font-semibold text-primary">✩All Access 99 (smart & tnt user only)</p>
              <p className="text-muted-foreground">- 7GB all apps + 2GB FB</p>
              <p className="text-muted-foreground">- 15 days</p>
              <p className="font-medium text-accent">• ₱65</p>
            </div>
            
            <div className="p-3 bg-background/50 rounded border border-border/50">
              <p className="font-semibold text-primary">✩Power All 99 FB/TIKTOK (smart user only)</p>
              <p className="text-muted-foreground">- 10GB data + unli FB/TikTok</p>
              <p className="text-muted-foreground">- Unli call & text</p>
              <p className="text-muted-foreground">- 7 days</p>
              <p className="font-medium text-accent">•₱65</p>
            </div>
            
            <div className="p-3 bg-background/50 rounded border border-border/50">
              <p className="font-semibold text-primary">✩Saya All 99 (tnt user only)</p>
              <p className="text-muted-foreground">- 6GB + unli FB, ML, TikTok</p>
              <p className="text-muted-foreground">- Unli call & text</p>
              <p className="text-muted-foreground">- 7 days</p>
              <p className="font-medium text-accent">• ₱65</p>
            </div>
            
            <div className="p-3 bg-background/50 rounded border border-border/50">
              <p className="font-semibold text-primary">✩Power all 149 FB/TIKTOK (smart user only)</p>
              <p className="text-muted-foreground">- 16gb + Unli 5g</p>
              <p className="text-muted-foreground">- Unli FB/TikTok</p>
              <p className="text-muted-foreground">- Unli call & text</p>
              <p className="text-muted-foreground">- 7 days</p>
              <p className="font-medium text-accent">• ₱145</p>
            </div>
            
            <div className="p-3 bg-background/50 rounded border border-border/50">
              <p className="font-semibold text-primary">✩Saya all 149 (tnt user only)</p>
              <p className="text-muted-foreground">- 12gb + Unli 5g</p>
              <p className="text-muted-foreground">- Unli FB/TikTok/MLBB</p>
              <p className="text-muted-foreground">- Unli call & text</p>
              <p className="text-muted-foreground">- 7 days</p>
              <p className="font-medium text-accent">• ₱145</p>
            </div>
            
            <div className="p-3 bg-background/50 rounded border border-border/50">
              <p className="font-semibold text-primary">✩Tiktok Saya 50 (tnt user only)</p>
              <p className="text-muted-foreground">- 3gb all apps & sites</p>
              <p className="text-muted-foreground">- Unli call & text</p>
              <p className="text-muted-foreground">- 3 days</p>
              <p className="font-medium text-accent">• ₱45</p>
            </div>
          </div>
          
          <div className="p-3 bg-primary/10 rounded border border-primary/20">
            <p className="font-medium text-primary text-center">PM ME TO AVAIL THE DISCOUNTED PROMO LOAD.</p>
            <div className="mt-2 flex justify-center">
              <a 
                href="https://www.facebook.com/share/1FJiMs1jEJ/"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <Button onClick={handleClose} className="bg-primary hover:bg-primary/90">
              Continue Browsing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};