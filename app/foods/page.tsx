'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFoodSearch } from '@/hooks/use-food-search';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default function FoodsPage() {
  const [query, setQuery] = useState('');
  const { data: foods, isLoading } = useFoodSearch(query);

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Search Foods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for a food..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading && (
            <div className="text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}

          {!isLoading && query.length > 0 && foods && foods.length === 0 && (
            <div className="text-center text-sm text-muted-foreground">
              No foods found
            </div>
          )}

          {!isLoading && foods && foods.length > 0 && (
            <div className="space-y-2">
              {foods.map((food) => (
                <Link
                  key={food.id}
                  href={`/foods/${food.id}`}
                  className="block rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{food.name}</div>
                      {food.category && (
                        <div className="text-sm text-muted-foreground">
                          {food.category}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">{food.data_type}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
