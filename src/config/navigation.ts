import {
  Home,
  FileText,
  Star,
  Clock,
  CreditCard,
  Settings,
  Users,
  BarChart3,
  Shield,
} from 'lucide-react';

export const dashboardNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/documents', icon: FileText, label: 'Documents' },
  { href: '/favorites', icon: Star, label: 'Favorites' },
  { href: '/recent', icon: Clock, label: 'Recent' },
  { href: '/subscription', icon: CreditCard, label: 'Subscription' },
  { href: '/settings', icon: Settings, label: 'Settings' },
] as const;

export const mobileNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/documents', icon: FileText, label: 'Docs' },
  { href: '/favorites', icon: Star, label: 'Favorites' },
  { href: '/recent', icon: Clock, label: 'Recent' },
  { href: '/settings', icon: Settings, label: 'Settings' },
] as const;

export const adminNavItems = [
  { href: '/admin', icon: BarChart3, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { href: '/admin/revenue', icon: BarChart3, label: 'Revenue' },
] as const;
