"use client";

import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

export function ConfirmActionButton({
  children,
  message,
  onClick,
  ...props
}: ButtonProps & { message: string }) {
  return (
    <Button
      {...props}
      type="submit"
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </Button>
  );
}
