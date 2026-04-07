// Temporary fix for React 19 type compatibility
declare module "react" {
  interface ForwardRefExoticComponent<P> extends React.FC<P> {}
  export function forwardRef<T, P = {}>(
    render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
  ): React.ForwardRefExoticComponent<P & React.RefAttributes<T>>;
  
  export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {}
  export interface InputHTMLAttributes<T> extends HTMLAttributes<T> {}
  
  export type ReactNode = React.ReactElement | string | number | React.ReactFragment | React.ReactPortal | boolean | null | undefined;
  
  export function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prev: S) => S)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  
  interface HTMLAttributes<T> {
    className?: string;
    children?: ReactNode;
  }
}

declare module "@radix-ui/react-slot" {
  export const Slot: React.ForwardRefExoticComponent<any>;
}
