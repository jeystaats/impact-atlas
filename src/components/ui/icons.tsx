"use client";

import {
  Thermometer,
  Waves,
  Camera,
  Ship,
  Leaf,
  Sprout,
  Trees,
  Droplets,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
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
  Check,
  Info,
  ExternalLink,
  Download,
  Share2,
  Filter,
  MoreVertical,
  Play,
  Calendar,
  Loader2,
  Anchor,
  Bug,
  RefreshCw,
  Plus,
  ClipboardList,
  BarChart3,
  Layers,
  Locate,
  Maximize2,
  Eye,
  EyeOff,
  Activity,
  Clock,
  ChevronUp,
  CircleDot,
  Hexagon,
  Trash2,
  Bell,
  BellRing,
  Minimize2,
  Wind,
  type LucideProps,
} from "lucide-react";

export const Icons = {
  thermometer: Thermometer,
  waves: Waves,
  camera: Camera,
  ship: Ship,
  leaf: Leaf,
  sprout: Sprout,
  trees: Trees,
  droplets: Droplets,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  arrowUpRight: ArrowUpRight,
  arrowDownRight: ArrowDownRight,
  arrowRight: ArrowRight,
  minus: Minus,
  mapPin: MapPin,
  globe: Globe,
  sparkles: Sparkles,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  trendUp: TrendingUp,
  trendDown: TrendingDown,
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
  check: Check,
  info: Info,
  externalLink: ExternalLink,
  download: Download,
  share: Share2,
  filter: Filter,
  more: MoreVertical,
  play: Play,
  calendar: Calendar,
  loader: Loader2,
  anchor: Anchor,
  bug: Bug,
  refresh: RefreshCw,
  plus: Plus,
  clipboard: ClipboardList,
  chart: BarChart3,
  layers: Layers,
  locate: Locate,
  maximize: Maximize2,
  eye: Eye,
  eyeOff: EyeOff,
  activity: Activity,
  clock: Clock,
  circleDot: CircleDot,
  hexagon: Hexagon,
  trash: Trash2,
  bell: Bell,
  bellRing: BellRing,
  minimize: Minimize2,
  wind: Wind,
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
    "air-quality": "wind",
  };

  const iconName = iconMap[moduleId] || "globe";
  return <Icon name={iconName} className={className} style={style} />;
}

// IconButton with 44px minimum touch target for accessibility
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  iconClassName?: string;
  label: string; // Required for accessibility
}

export function IconButton({
  icon,
  iconClassName = "w-4 h-4",
  label,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`
        min-h-[44px] min-w-[44px]
        flex items-center justify-center
        p-2 rounded-lg
        hover:bg-[var(--background-tertiary)]
        transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
        ${className || ""}
      `.trim()}
      {...props}
    >
      <Icon name={icon} className={iconClassName} />
    </button>
  );
}
