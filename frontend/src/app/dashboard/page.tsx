'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const today = new Date().toISOString().split('T')[0];

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

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
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
            {mealsData?.meals.length === 0 ? (
              <p className="text-muted-foreground">Aucun repas enregistré aujourd'hui</p>
            ) : (
              <div className="space-y-4">
                {mealsData?.meals.map((meal) => (
                  <div key={meal.id} className="border-b pb-2">
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
