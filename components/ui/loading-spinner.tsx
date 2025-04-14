/**
 * @description
 * A simple loading spinner component using lucide-react's Loader2 icon.
 * Intended for use as a fallback in React Suspense boundaries or to indicate
 * pending states during data fetching or action processing.
 *
 * @dependencies
 * - lucide-react (Loader2): The icon used for the spinner.
 * - @/lib/utils (cn): Utility for merging class names.
 *
 * @props
 * - className?: Optional additional CSS classes to apply to the spinner container.
 * - size?: Optional size for the spinner icon (defaults to 'h-6 w-6').
 */
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: string; // e.g., 'h-4 w-4', 'h-8 w-8'
}

export default function LoadingSpinner({
  className,
  size = 'h-6 w-6', // Default size
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center text-muted-foreground',
        className,
      )}
    >
      <Loader2 className={cn('animate-spin', size)} />
      <span className="sr-only">Carregando...</span> {/* For accessibility */}
    </div>
  );
}