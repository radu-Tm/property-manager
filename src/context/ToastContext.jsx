import React from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useNotification = () => {
  const { toast } = useToast();

  const showSuccess = (message) => {
    toast({
      title: "Succes",
      description: message,
      className: "bg-green-50 border-green-200",
    });
  };

  const showError = (message) => {
    toast({
      title: "Eroare",
      description: message,
      variant: "destructive",
    });
  };

  return { showSuccess, showError };
};