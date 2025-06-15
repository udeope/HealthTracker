'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Activity,
  Calendar,
  Heart,
  FileText,
  MessageCircle,
  Settings,
  Crown,
  X,
  Pill,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Health Metrics', href: '/metrics', icon: Activity },
  { name: 'Medications', href: '/medications', icon: Pill },
  { name: 'Symptoms', href: '/symptoms', icon: Heart },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Consultations', href: '/consultations', icon: MessageCircle, premium: true },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp, premium: true },
];

const adminNavigation = [
  { name: 'Patient Management', href: '/admin/patients', icon: Users },
  { name: 'Compliance', href: '/admin/compliance', icon: Shield },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isPremium, setIsPremium] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">HealthTracker</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-3 py-4">
            {/* Premium Banner */}
            {!isPremium && (
              <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-primary">Upgrade to Pro</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Unlock advanced analytics and unlimited consultations
                </p>
                <Button size="sm" className="w-full">
                  Upgrade Now
                </Button>
              </div>
            )}

            {/* Main Navigation */}
            <nav className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-3">
                Health Management
              </p>
              {navigation.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start space-x-3 h-11",
                      pathname === item.href && "bg-primary/10 text-primary border-primary/20"
                    )}
                    disabled={item.premium && !isPremium}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.premium && !isPremium && (
                      <Badge variant="secondary" className="text-xs">
                        Pro
                      </Badge>
                    )}
                  </Button>
                </Link>
              ))}

              {/* Admin Section */}
              <div className="pt-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-3">
                  Administration
                </p>
                {adminNavigation.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start space-x-3 h-11",
                        pathname === item.href && "bg-primary/10 text-primary border-primary/20"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <Link href="/settings">
              <Button variant="ghost" className="w-full justify-start space-x-3 h-11">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}