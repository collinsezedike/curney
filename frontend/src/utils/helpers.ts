import { format, formatDistanceToNow } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatTimeRemaining = (endTime: Date): string => {
  const now = new Date();
  const end = new Date(endTime);
  
  if (end <= now) {
    return 'Ended';
  }
  
  return formatDistanceToNow(end, { addSuffix: true });
};

export const formatDate = (date: Date): string => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const calculatePayout = (prediction: number, finalValue: number, stake: number): number => {
  const accuracy = Math.max(0, 1 - Math.abs(prediction - finalValue) / Math.max(prediction, finalValue, 1));
  return stake * (1 + accuracy * 2); // Simple payout formula
};

export const truncateAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};