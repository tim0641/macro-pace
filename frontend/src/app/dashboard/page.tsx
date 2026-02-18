'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dayStats', today],
    queryFn: () => apiClient.getDayStats(today),
  });

  const { data: mealsData } = useQuery({
    queryKey: ['meals', today],
    queryFn: () => apiClient.getMeals(today),
  });

  const { data: workouts } = useQuery({
    queryKey: ['workouts', today],
    queryFn: () => apiClient.getWorkouts(today, today),
  });

  const deleteMealMutation = useMutation({
    mutationFn: (mealId: string) => apiClient.deleteMeal(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['dayStats'] });
      setDeleteError(null);
    },
    onError: (err: Error) => {
      setDeleteError(err.message);
    },
  });

  const handleDeleteMeal = (mealId: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Supprimer ce repas ?')) return;
    deleteMealMutation.mutate(mealId);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
      router.push('/login');
    }
  }, [router]);

  if (isLoading) {
    return <div className="container mx-auto p-6">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <div className="space-x-2">
          <Link href="/foods">
            <Button variant="outline">Aliments</Button>
          </Link>
          <Link href="/log/meal">
            <Button variant="outline">Ajouter un repas</Button>
          </Link>
          <Link href="/log/workout">
            <Button variant="outline">Ajouter un entraînement</Button>
          </Link>
          <Button variant="outline" onClick={logout}>
            Déconnexion
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{Math.round(stats.nutrition.kcal)}</p>
              <p className="text-sm text-muted-foreground">
                Brûlé: {stats.workouts.totalBurnKcal} kcal
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Protéines</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{Math.round(stats.nutrition.protein)}g</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Glucides</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{Math.round(stats.nutrition.carbs)}g</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lipides</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{Math.round(stats.nutrition.fat)}g</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Repas du jour</CardTitle>
            <CardDescription>{mealsData?.meals.length || 0} repas</CardDescription>
          </CardHeader>
          <CardContent>
            {deleteError && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {deleteError}
              </div>
            )}
            {mealsData?.meals.length === 0 ? (
              <p className="text-muted-foreground">Aucun repas enregistré aujourd'hui</p>
            ) : (
              <div className="space-y-4">
                {mealsData?.meals.map((meal) => (
                  <div key={meal.id} className="border-b pb-2 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex justify-between">
                        <span className="font-medium capitalize">{meal.mealType}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(meal.eatenAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {meal.items.length > 0 && (
                        <div className="mt-1 text-sm text-muted-foreground">
                          {meal.items.length} aliment(s) •{' '}
                          {Math.round(
                            meal.items.reduce((sum, item) => sum + Number(item.kcal), 0)
                          )}{' '}
                          kcal
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteMeal(meal.id)}
                      disabled={deleteMealMutation.isPending}
                      aria-label="Supprimer le repas"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entraînements du jour</CardTitle>
            <CardDescription>
              {workouts?.length || 0} entraînement(s) •{' '}
              {stats?.workouts.totalDurationMin || 0} min
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workouts?.length === 0 ? (
              <p className="text-muted-foreground">Aucun entraînement enregistré aujourd'hui</p>
            ) : (
              <div className="space-y-4">
                {workouts?.map((workout) => (
                  <div key={workout.id} className="border-b pb-2">
                    <div className="flex justify-between">
                      <span className="font-medium capitalize">{workout.type}</span>
                      <span className="text-sm text-muted-foreground">
                        {workout.durationMin} min
                      </span>
                    </div>
                    {workout.type === 'run' && workout.runDetails && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {workout.runDetails.distanceKm} km
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
