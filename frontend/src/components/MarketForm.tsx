import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@radix-ui/themes';

const marketSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Category is required'),
  endTime: z.string().min(1, 'End time is required'),
});

type MarketFormData = z.infer<typeof marketSchema>;

interface MarketFormProps {
  onSubmit: (data: MarketFormData) => void;
  isLoading?: boolean;
}

const MarketForm: React.FC<MarketFormProps> = ({ onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MarketFormData>({
    resolver: zodResolver(marketSchema),
  });

  const minDateTime = new Date();
  minDateTime.setHours(minDateTime.getHours() + 1);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
          Market Question
        </label>
        <input
          {...register('question')}
          type="text"
          id="question"
          placeholder="What will be the price of Bitcoin on December 31, 2024?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
        />
        {errors.question && (
          <p className="mt-1 text-sm text-red-600">{errors.question.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={4}
          placeholder="Provide additional context and resolution criteria..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          {...register('category')}
          id="category"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
        >
          <option value="">Select a category</option>
          <option value="crypto">Cryptocurrency</option>
          <option value="stocks">Stocks</option>
          <option value="sports">Sports</option>
          <option value="politics">Politics</option>
          <option value="economics">Economics</option>
          <option value="other">Other</option>
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
          End Time
        </label>
        <input
          {...register('endTime')}
          type="datetime-local"
          id="endTime"
          min={minDateTime.toISOString().slice(0, 16)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
        />
        {errors.endTime && (
          <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-lime-500 hover:bg-lime-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
      >
        {isLoading ? 'Creating Market...' : 'Create Market'}
      </Button>
    </form>
  );
};

export default MarketForm;