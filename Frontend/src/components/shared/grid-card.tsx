import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GridCardProps {
  title: string;
  subtitle?: string | React.ReactNode;
  icon: React.ReactNode;
  iconBgColor?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  metaLeft?: {
    icon: any;
    label: string;
  };
  metaRight?: {
    icon: any;
    label: string;
  };
  className?: string;
  delay?: number;
  statusNode?: React.ReactNode;
  children?: React.ReactNode;
}

export function GridCard({
  title,
  subtitle,
  icon,
  iconBgColor,
  onEdit,
  onDelete,
  metaLeft,
  metaRight,
  className,
  delay = 0,
  statusNode,
  children
}: GridCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="h-full"
    >
      <Card className={cn(
        "group relative overflow-hidden p-5 border border-border/60 bg-card rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 h-full flex flex-col",
        className
      )}>
        {/* Header: Icon & Actions */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className="h-10 w-10 rounded-xl grid place-items-center shadow-md text-white shrink-0 overflow-hidden" 
            style={{ backgroundColor: iconBgColor }}
          >
            {icon}
          </div>
          
          <div className="flex items-center gap-1 translate-y-[-4px]">
            {statusNode}
            {onEdit && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors" 
                onClick={onEdit}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" 
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Content: Title & Subtitle */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
            {title}
          </h3>
          {subtitle && (
            <div className="flex items-center gap-2 mt-1">
              {typeof subtitle === 'string' && iconBgColor && (
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: iconBgColor }} />
              )}
              <span className="text-[12px] text-muted-foreground font-mono truncate">
                {subtitle}
              </span>
            </div>
          )}
          {children}
        </div>

        {/* Footer: Meta Info */}
        {(metaLeft || metaRight) && (
          <div className="pt-3 border-t border-border/40 flex items-center justify-between mt-auto gap-2">
            {metaLeft && (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md truncate max-w-[60%]">
                <metaLeft.icon className="h-3.5 w-3.5 shrink-0" /> 
                <span className="truncate">{metaLeft.label}</span>
              </div>
            )}
            {metaRight && (
              <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1 shrink-0">
                <metaRight.icon className="h-3 w-3" /> {metaRight.label}
              </span>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
