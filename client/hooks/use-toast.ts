import * as React from "react";
import { ToastProps } from "../components/ui/toast";

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000;

// Action types
const ACTION_TYPES = {
  ADD_TOAST: "ADD_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type Action =
  | {
      type: typeof ACTION_TYPES.ADD_TOAST;
      toast: ToasterToast;
    }
  | {
      type: typeof ACTION_TYPES.DISMISS_TOAST;
      toastId?: string;
    }
  | {
      type: typeof ACTION_TYPES.REMOVE_TOAST;
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: ACTION_TYPES.REMOVE_TOAST,
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  // Use the state parameter directly in the reducer
  switch (action.type) {
    case ACTION_TYPES.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case ACTION_TYPES.DISMISS_TOAST: {
      const { toastId } = action;
      // Create a new array to avoid mutating the state directly
      const toasts = [...state.toasts];

      // Side effect: add to remove queue
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        // Dismiss all toasts
        toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      // Update the toasts array to mark them as not open
      const updatedToasts = toasts.map((toast) =>
        toast.id === toastId || toastId === undefined
          ? {
              ...toast,
              open: false,
            }
          : toast,
      );

      // Return a new state object with the updated toasts
      return {
        ...state,
        toasts: updatedToasts,
      };
    }
    case ACTION_TYPES.REMOVE_TOAST: {
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    }
    default:
      return state;
  }
};

const listeners: ((state: State) => void)[] = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, "id">;

function toast(props: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: ACTION_TYPES.ADD_TOAST,
      toast: {
        ...props,
        id,
      },
    });

  const dismiss = () =>
    dispatch({ type: ACTION_TYPES.DISMISS_TOAST, toastId: id });

  dispatch({
    type: ACTION_TYPES.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

function useToast() {
  const [_, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...memoryState,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: ACTION_TYPES.DISMISS_TOAST, toastId }),
  };
}

export { useToast, toast };
