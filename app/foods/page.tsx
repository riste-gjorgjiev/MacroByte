'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFoodSearch } from '@/hooks/use-food-search';
import { useDebounce } from '@/hooks/use-debounce';
import Link from 'next/link';
import { Search, Plus } from 'lucide-react';

const CATEGORIES = [
  'all',
  'Fruits',
  'Vegetables',
  'Proteins',
  'Grains',
  'Nuts & Seeds',
  'Fats & Oils',
  'Beverages',
  'Snacks & Sweets',
];

export default function FoodsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const debouncedQuery = useDebounce(query, 300);
  const { data: foods, isLoading } = useFoodSearch(debouncedQuery, category);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Food Search</h1>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for a food..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-12 text-lg border-gray-200 focus:border-gray-900"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {isLoading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && query.length > 0 && foods && foods.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No foods found
          </div>
        )}

        {!isLoading && foods && foods.length > 0 && (
          <div className="space-y-2">
            {foods.map((food) => (
              <Link
                key={food.id}
                href={`/foods/${food.id}`}
                className="block rounded-lg border border-gray-200 p-4 transition-all hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{food.name}</div>
                    {food.category && (
                      <div className="text-sm text-gray-500 mt-1">
                        {food.category}
                      </div>
                    )}
                  </div>
                  <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
