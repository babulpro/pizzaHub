import { toast } from "sonner";

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * PizzaHub Custom Branded Toast Notifications
 */
export const showToast = {
  /**
   * Standard Success Toast
   */
  success: (message: string, descriptionOrOptions?: string | ToastOptions) => {
    const opts =
      typeof descriptionOrOptions === "string"
        ? { description: descriptionOrOptions }
        : descriptionOrOptions;
    return toast.success(message, {
      ...opts,
      icon: "✅",
    });
  },

  /**
   * Special Pizza-Themed Toast (Orders, VIP Drops, Signature Pizzas)
   */
  pizza: (message: string, descriptionOrOptions?: string | ToastOptions) => {
    const opts =
      typeof descriptionOrOptions === "string"
        ? { description: descriptionOrOptions }
        : descriptionOrOptions;
    return toast(message, {
      ...opts,
      icon: "🍕",
      style: {
        background: "linear-gradient(135deg, #18181c 0%, #1f1414 100%)",
        borderColor: "rgba(245, 158, 11, 0.45)",
        color: "#ffffff",
      },
    });
  },

  /**
   * Fire / Hot Deals & Countdown Toast
   */
  fire: (message: string, descriptionOrOptions?: string | ToastOptions) => {
    const opts =
      typeof descriptionOrOptions === "string"
        ? { description: descriptionOrOptions }
        : descriptionOrOptions;
    return toast(message, {
      ...opts,
      icon: "🔥",
      style: {
        background: "linear-gradient(135deg, #18181c 0%, #201210 100%)",
        borderColor: "rgba(239, 68, 68, 0.45)",
        color: "#ffffff",
      },
    });
  },

  /**
   * Error Notification Toast
   */
  error: (message: string, descriptionOrOptions?: string | ToastOptions) => {
    const opts =
      typeof descriptionOrOptions === "string"
        ? { description: descriptionOrOptions }
        : descriptionOrOptions;
    return toast.error(message, {
      ...opts,
      icon: "❌",
    });
  },

  /**
   * Warning / Attention Toast
   */
  warning: (message: string, descriptionOrOptions?: string | ToastOptions) => {
    const opts =
      typeof descriptionOrOptions === "string"
        ? { description: descriptionOrOptions }
        : descriptionOrOptions;
    return toast.warning(message, {
      ...opts,
      icon: "⚠️",
    });
  },

  /**
   * Informational Toast
   */
  info: (message: string, descriptionOrOptions?: string | ToastOptions) => {
    const opts =
      typeof descriptionOrOptions === "string"
        ? { description: descriptionOrOptions }
        : descriptionOrOptions;
    return toast.info(message, {
      ...opts,
      icon: "ℹ️",
    });
  },

  /**
   * Dismiss a specific toast or all toasts
   */
  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  },

  /**
   * Promise Toast (Loading -> Success/Error)
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },
};

export default showToast;
