'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface AceternityExpandCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  initiallyExpanded?: boolean;
  icon?: React.ReactNode;
}

export function AceternityExpandCard({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  initiallyExpanded = false,
  icon,
}: AceternityExpandCardProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm transition-all hover:shadow-md",
        isExpanded ? "shadow-md" : "",
        className
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex w-full items-center justify-between gap-4 p-6",
          headerClassName
        )}
      >
        <div className="flex items-center gap-4">
          {icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-muted text-foreground/80">
              {icon}
            </div>
          )}
          <div className="text-left">
            <h3 className="font-semibold">{title}</h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>

        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border bg-background text-foreground transition-transform",
            isExpanded ? "rotate-180" : "group-hover:bg-accent/50"
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={cn("border-t p-6", contentClassName)}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}