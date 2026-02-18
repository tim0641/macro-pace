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
        sugar100g: payload.food.sugar100g,
        fiber100g: payload.food.fiber100g,
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
    <div className="min-h-screen">
      <header className="nav-bar sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight">Macro Pace</h1>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard"><Button variant="ghost" size="sm">Tableau de bord</Button></Link>
            <Link href="/profile"><Button variant="outline" size="sm">Profil</Button></Link>
            <Link href="/foods"><Button variant="outline" size="sm" className="border-primary/50 bg-primary/5">Aliments</Button></Link>
            <Link href="/log/meal"><Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">+ Repas</Button></Link>
            <Link href="/log/workout"><Button variant="outline" size="sm">+ Entraînement</Button></Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Aliments</h2>
          <p className="text-sm text-muted-foreground">Recherchez et ajoutez des aliments Ciqual</p>
        </div>

      <div className="space-y-4">
        <Input
          placeholder="Rechercher un aliment..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md border-border/80 focus-visible:ring-primary/30 h-11"
        />
      </div>

      {quickAddError && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {quickAddError}
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><span className="animate-pulse">Chargement...</span></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods?.map((food) => (
            <Card key={food.externalId} className="relative card-elevated border-border/80 hover:border-primary/30 transition-colors">
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
      </main>
    </div>
  );
}
