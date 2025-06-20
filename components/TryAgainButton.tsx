'use client';

import { Button } from '@/components/ui/button';

interface TryAgainButtonProps {
  onRetry?: () => void;
}

export default function TryAgainButton({ onRetry }: TryAgainButtonProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <Button onClick={handleRetry}>
      Try Again
    </Button>
  );
}