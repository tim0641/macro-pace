'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { FoodSearchResult } from '@/lib/api/types';

export default function FoodsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [quickAddError, setQuickAddError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
      router.push('/login');
    }
  }, [router]);

  const { data: foods, isLoading } = useQuery({
    queryKey: ['foods', searchQuery],
    queryFn: () => apiClient.searchFoods(searchQuery),
  });

  const quickAddMutation = useMutation({
    mutationFn: (payload: { food: FoodSearchResult; grams: number }) =>
      apiClient.quickAddMealItem({
        foodSource: 'ciqual',
        externalFoodId: payload.food.externalId,
        foodName: payload.food.name,
        foodBrand: payload.food.brand ?? undefined,
        kcal100g: payload.food.kcal100g,
        protein100g: payload.food.protein100g,
        carbs100g: payload.food.carbs100g,
        fat100g: payload.food.fat100g,
        grams: payload.grams,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['dayStats'] });
      queryClient.invalidateQueries({ queryKey: ['weekStats'] });
      setQuickAddError(null);
    },
    onError: (err: Error) => {
      setQuickAddError(err.message);
    },
  });

  const handleQuickAdd = (food: FoodSearchResult) => {
    if (typeof window === 'undefined') return;
    const raw = window.prompt(`Quantité en grammes pour "${food.name}" ?`, '100');
    if (raw === null) return;
    const grams = parseFloat(raw.replace(',', '.'));
    if (isNaN(grams) || grams <= 0) {
      setQuickAddError('Quantité invalide');
      return;
    }
    quickAddMutation.mutate({ food, grams });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Aliments</h1>
        <div className="space-x-2">
          <Link href="/dashboard">
            <Button variant="outline">Retour</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Rechercher un aliment..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Résultats fournis à la demande via une API externe (ex: USDA FoodData Central).
        </p>
      </div>

      {quickAddError && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {quickAddError}
        </div>
      )}
      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods?.map((food) => (
            <Card key={food.externalId} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => handleQuickAdd(food)}
                disabled={quickAddMutation.isPending}
                aria-label="Ajouter rapidement"
                title="Ajouter au journal (repas snack du jour)"
              >
                <Plus className="h-5 w-5" />
              </Button>
              <CardHeader>
                <CardTitle className="text-lg pr-10">{food.name}</CardTitle>
                {food.brand && (
                  <CardDescription>{food.brand}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div>Kcal: {food.kcal100g} / 100g</div>
                  <div>Protéines: {food.protein100g}g</div>
                  <div>Glucides: {food.carbs100g}g</div>
                  <div>Lipides: {food.fat100g}g</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
