import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal Slot: renders its single child, merging className and other props.
 * A lightweight stand-in for @radix-ui/react-slot to keep the primitive layer
 * dependency-free until full Radix primitives are needed.
 */
export const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, className, ...props }, ref) => {
    if (!React.isValidElement(children)) {
      return null;
    }

    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props;

    return React.cloneElement(child, {
      ...props,
      ...childProps,
      ref,
      className: cn(className, childProps.className as string | undefined),
    });
  },
);
Slot.displayName = "Slot";
