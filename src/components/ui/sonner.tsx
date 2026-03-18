"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { useState, useEffect } from "react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const TOAST_CLASSES = {
  toast:
    "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
  description: "group-[.toast]:text-muted-foreground",
  actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
  cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
};

function SonnerWithTheme(props: ToasterProps) {
  const { theme = "system" } = useTheme();
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{ classNames: TOAST_CLASSES }}
      {...props}
    />
  );
}

const Toaster = (props: ToasterProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Sonner
        theme="light"
        className="toaster group"
        toastOptions={{ classNames: TOAST_CLASSES }}
        {...props}
      />
    );
  }
  return <SonnerWithTheme {...props} />;
};

export { Toaster, toast };
