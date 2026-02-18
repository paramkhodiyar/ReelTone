"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Scissors, Library } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Download", icon: Download, path: "/" },
    { name: "Trim", icon: Scissors, path: "/trim" },
    { name: "Library", icon: Library, path: "/library" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card border-t border-border flex items-center justify-around px-6 z-50">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <Link
            key={tab.name}
            href={tab.path}
            className="flex flex-col items-center justify-center space-y-1 relative w-full h-full text-muted-foreground"
          >
            {isActive && (
              <motion.div
                layoutId="nav-bg"
                className="absolute inset-0 bg-accent rounded-xl -z-10 m-2"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <tab.icon
              className={`w-6 h-6 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <span
              className={`text-xs font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
