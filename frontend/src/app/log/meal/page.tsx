'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LogMealPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mealType, setMealType] = useState('breakfast');
  const [eatenAt, setEatenAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [note, setNote] = useState('');
  const [foodQuery, setFoodQuery] = useState('');
  const [selectedExternalFoodId, setSelectedExternalFoodId] = useState('');
  const [grams, setGrams] = useState('');
  const [currentMealId, setCurrentMealId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
      router.push('/login');
    }
  }, [router]);

  const { data: foods, isFetching: isFetchingFoods } = useQuery({
    queryKey: ['foods', foodQuery],
    queryFn: () => apiClient.searchFoods(foodQuery, 30),
  });

  const createMealMutation = useMutation({
    mutationFn: () =>
      apiClient.createMeal({
        eatenAt: new Date(eatenAt).toISOString(),
        mealType,
        note: note || undefined,
      }),
    onSuccess: (meal) => {
      setCurrentMealId(meal.id);
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: () =>
      apiClient.addMealItem(currentMealId!, (() => {
        const selected = foods?.find((f) => f.externalId === selectedExternalFoodId);
        if (!selected) {
          throw new Error('Veuillez sélectionner un aliment');
        }
        return {
          foodSource: 'ciqual' as const,
          externalFoodId: selected.externalId,
          foodName: selected.name,
          foodBrand: selected.brand ?? undefined,
          kcal100g: selected.kcal100g,
          protein100g: selected.protein100g,
          carbs100g: selected.carbs100g,
          fat100g: selected.fat100g,
          sugar100g: selected.sugar100g,
          fiber100g: selected.fiber100g,
          grams: parseFloat(grams),
        };
      })()),
    onSuccess: () => {
      // Recharger les repas et les stats journalières (totaux kcal/macros)
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['dayStats'] });
      queryClient.invalidateQueries({ queryKey: ['weekStats'] });
      setSelectedExternalFoodId('');
      setGrams('');
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ajouter un repas</h1>
        <Link href="/dashboard">
          <Button variant="outline">Retour</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau repas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Type de repas</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Petit-déjeuner</SelectItem>
                <SelectItem value="lunch">Déjeuner</SelectItem>
                <SelectItem value="dinner">Dîner</SelectItem>
                <SelectItem value="snack">Collation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date et heure</Label>
            <Input
              type="datetime-local"
              value={eatenAt}
              onChange={(e) => setEatenAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Note (optionnel)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Après entraînement"
            />
          </div>

          {!currentMealId ? (
            <Button
              onClick={() => createMealMutation.mutate()}
              disabled={createMealMutation.isPending}
            >
              {createMealMutation.isPending ? 'Création...' : 'Créer le repas'}
            </Button>
          ) : (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Ajouter des aliments</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Recherche</Label>
                  <Input
                    value={foodQuery}
                    onChange={(e) => setFoodQuery(e.target.value)}
                    placeholder="Ex: chicken, banana..."
                  />
                </div>
                <div className="space-y-2" />
                <div className="space-y-2 col-span-2">
                  <Label>Aliment</Label>
                  <Select value={selectedExternalFoodId} onValueChange={setSelectedExternalFoodId}>
                    <SelectTrigger>
                      <SelectValue placeholder={isFetchingFoods ? 'Recherche...' : 'Sélectionner un aliment'} />
                    </SelectTrigger>
                    <SelectContent>
                      {foods?.map((food) => (
                        <SelectItem key={food.externalId} value={food.externalId}>
                          {food.name} {food.brand && `(${food.brand})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Quantité (g)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={grams}
                    onChange={(e) => setGrams(e.target.value)}
                    placeholder="150"
                  />
                </div>
              </div>
              <Button
                onClick={() => addItemMutation.mutate()}
                disabled={!selectedExternalFoodId || !grams || addItemMutation.isPending}
              >
                {addItemMutation.isPending ? 'Ajout...' : 'Ajouter'}
              </Button>
              {addItemMutation.isError && (
                <p className="text-sm text-destructive">
                  {(addItemMutation.error as Error).message}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
