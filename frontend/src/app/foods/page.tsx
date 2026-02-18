'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FoodsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    brand: '',
    kcal100g: '',
    protein100g: '',
    carbs100g: '',
    fat100g: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
      router.push('/login');
    }
  }, [router]);

  const { data: foods, isLoading } = useQuery({
    queryKey: ['foods', searchQuery],
    queryFn: () => apiClient.searchFoods(searchQuery),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiClient.createFood({
        name: newFood.name,
        brand: newFood.brand || undefined,
        kcal100g: parseFloat(newFood.kcal100g),
        protein100g: parseFloat(newFood.protein100g),
        carbs100g: parseFloat(newFood.carbs100g),
        fat100g: parseFloat(newFood.fat100g),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      setShowCreateForm(false);
      setNewFood({
        name: '',
        brand: '',
        kcal100g: '',
        protein100g: '',
        carbs100g: '',
        fat100g: '',
      });
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Aliments</h1>
        <div className="space-x-2">
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Annuler' : 'Créer un aliment'}
          </Button>
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
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un aliment</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input
                    value={newFood.name}
                    onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Marque (optionnel)</Label>
                  <Input
                    value={newFood.brand}
                    onChange={(e) => setNewFood({ ...newFood, brand: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kcal/100g</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newFood.kcal100g}
                    onChange={(e) => setNewFood({ ...newFood, kcal100g: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Protéines/100g (g)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newFood.protein100g}
                    onChange={(e) => setNewFood({ ...newFood, protein100g: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Glucides/100g (g)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newFood.carbs100g}
                    onChange={(e) => setNewFood({ ...newFood, carbs100g: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lipides/100g (g)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newFood.fat100g}
                    onChange={(e) => setNewFood({ ...newFood, fat100g: e.target.value })}
                    required
                  />
                </div>
              </div>
              {createMutation.isError && (
                <p className="text-sm text-destructive">
                  {(createMutation.error as Error).message}
                </p>
              )}
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Création...' : 'Créer'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods?.map((food) => (
            <Card key={food.id}>
              <CardHeader>
                <CardTitle className="text-lg">{food.name}</CardTitle>
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
