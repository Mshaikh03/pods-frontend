import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Headphones, User, Menu, X } from "lucide-react";
import { AccountLinkModal } from "./AccountLinkModal";

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">PodcastHub</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="text-foreground">
              Discover
            </Button>
            <Button variant="ghost" className="text-foreground">
              Trending
            </Button>
            <Button variant="ghost" className="text-foreground">
              Categories
            </Button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              <User className="mr-2 h-4 w-4" />
              Connect Account
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start text-foreground">
                Discover
              </Button>
              <Button variant="ghost" className="w-full justify-start text-foreground">
                Trending
              </Button>
              <Button variant="ghost" className="w-full justify-start text-foreground">
                Categories
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsModalOpen(true)}
              >
                <User className="mr-2 h-4 w-4" />
                Connect Account
              </Button>
            </nav>
          </div>
        )}
      </header>

      <AccountLinkModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}