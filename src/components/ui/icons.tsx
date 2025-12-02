"use client";

import {
  Thermometer,
  Waves,
  Camera,
  Ship,
  Leaf,
  Sprout,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  MapPin,
  Globe,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Menu,
  X,
  Search,
  ChevronDown,
  Settings,
  User,
  LogOut,
  Home,
  LayoutDashboard,
  MessageSquare,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  Download,
  Share2,
  Filter,
  MoreVertical,
  type LucideProps,
} from "lucide-react";

export const Icons = {
  thermometer: Thermometer,
  waves: Waves,
  camera: Camera,
  ship: Ship,
  leaf: Leaf,
  sprout: Sprout,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  arrowUpRight: ArrowUpRight,
  arrowDownRight: ArrowDownRight,
  minus: Minus,
  mapPin: MapPin,
  globe: Globe,
  sparkles: Sparkles,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  menu: Menu,
  x: X,
  search: Search,
  settings: Settings,
  user: User,
  logOut: LogOut,
  home: Home,
  dashboard: LayoutDashboard,
  chat: MessageSquare,
  zap: Zap,
  target: Target,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
  externalLink: ExternalLink,
  download: Download,
  share: Share2,
  filter: Filter,
  more: MoreVertical,
};

export type IconName = keyof typeof Icons;

interface IconProps extends LucideProps {
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  const IconComponent = Icons[name];
  return <IconComponent {...props} />;
}

interface ModuleIconProps {
  moduleId: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ModuleIcon({ moduleId, className, style }: ModuleIconProps) {
  const iconMap: Record<string, IconName> = {
    "urban-heat": "thermometer",
    "coastal-plastic": "waves",
    "ocean-plastic": "camera",
    "port-emissions": "ship",
    "biodiversity": "leaf",
    "restoration": "sprout",
  };

  const iconName = iconMap[moduleId] || "globe";
  return <Icon name={iconName} className={className} style={style} />;
}
