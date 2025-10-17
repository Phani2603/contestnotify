'use client';

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface ExpandableCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  initiallyExpanded?: boolean;
  icon?: React.ReactNode;
}

export function ExpandableCard({
  title,
  children,
  className,
  headerClassName,
  initiallyExpanded = false,
  icon,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex w-full items-center justify-between p-4 font-medium transition-all",
          headerClassName
        )}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 transition-transform duration-200",
            isExpanded ? "rotate-180" : ""
          )}
        />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}