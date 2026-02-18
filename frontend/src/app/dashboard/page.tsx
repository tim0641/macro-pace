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
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  ComposedChart,
} from 'recharts';
import { MacroGauges } from '@/components/MacroGauges';

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

  const { data: weekStats } = useQuery({
    queryKey: ['weekStats', today],
    queryFn: () => apiClient.getWeekStats(today),
  });

  const deleteMealMutation = useMutation({
    mutationFn: (mealId: string) => apiClient.deleteMeal(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['dayStats'] });
      queryClient.invalidateQueries({ queryKey: ['weekStats'] });
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="nav-bar sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Macro Pace</h1>
          <nav className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="font-medium">Tableau de bord</Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" size="sm" className="border-border/80">Profil</Button>
            </Link>
            <Link href="/foods">
              <Button variant="outline" size="sm" className="border-border/80">Aliments</Button>
            </Link>
            <Link href="/log/meal">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">+ Repas</Button>
            </Link>
            <Link href="/log/workout">
              <Button variant="outline" size="sm" className="border-border/80">+ Entraînement</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
              Déconnexion
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-1">Tableau de bord</h2>
          <p className="text-sm text-muted-foreground">Vue d&apos;ensemble du jour</p>
        </div>

      {stats && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="card-elevated border-border/80">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Consommées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{Math.round(stats.nutrition.kcal)}</p>
                <p className="text-xs text-muted-foreground">kcal aujourd&apos;hui</p>
              </CardContent>
            </Card>
            <Card className="card-elevated border-border/80">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Brûlées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.workouts.totalBurnKcal}</p>
                <p className="text-xs text-muted-foreground">kcal (entraînements)</p>
              </CardContent>
            </Card>
            <Card className="card-elevated border-border/80">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Net
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {Math.round(stats.nutrition.kcal - stats.workouts.totalBurnKcal)}
                </p>
                <p className="text-xs text-muted-foreground">consommées − brûlées</p>
              </CardContent>
            </Card>
            <Card className="card-elevated border-border/80">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {stats.targets?.targetCalories ?? '—'}
                </p>
                <p className="text-xs text-muted-foreground">kcal objectif</p>
              </CardContent>
            </Card>
            <Card className="card-elevated border-border/80">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Écart
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.targets?.targetCalories != null ? (
                  <>
                    <p
                      className={`text-2xl font-bold ${
                        stats.nutrition.kcal - stats.targets.targetCalories > 0
                          ? 'text-amber-600'
                          : stats.nutrition.kcal - stats.targets.targetCalories < 0
                            ? 'text-blue-600'
                            : ''
                      }`}
                    >
                      {stats.nutrition.kcal - stats.targets.targetCalories > 0 ? '+' : ''}
                      {Math.round(stats.nutrition.kcal - stats.targets.targetCalories)}
                    </p>
                    <p className="text-xs text-muted-foreground">vs cible (kcal)</p>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Renseignez votre profil</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Jauges de progression macros */}
          <MacroGauges stats={stats} isLoading={isLoading} />

          {/* Macros du jour (camembert en kcal) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-elevated border-border/80">
              <CardHeader>
                <CardTitle>Macros du jour</CardTitle>
                <CardDescription>Répartition en calories (prot×4, gluc×4, lip×9)</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.nutrition.kcal > 0 ? (
                  (() => {
                    const macroPieData = [
                      { name: 'Protéines', value: Math.round(stats.nutrition.protein * 4), color: '#22c55e' },
                      { name: 'Glucides', value: Math.round(stats.nutrition.carbs * 4), color: '#3b82f6' },
                      { name: 'Lipides', value: Math.round(stats.nutrition.fat * 9), color: '#f59e0b' },
                    ].filter((d) => d.value > 0);
                    return (
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={macroPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value} kcal`}
                          >
                            {macroPieData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `${value} kcal`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    );
                  })()
                ) : (
                  <p className="text-muted-foreground text-sm py-8 text-center">
                    Aucune donnée nutritionnelle aujourd&apos;hui
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Graphiques 7 jours */}
            <Card className="card-elevated border-border/80">
              <CardHeader>
                <CardTitle>Calories sur 7 jours</CardTitle>
                <CardDescription>Consommées vs cible journalière</CardDescription>
              </CardHeader>
              <CardContent>
                {weekStats?.days?.length ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart
                      data={weekStats.days.map((d) => ({
                        date: d.date.slice(5),
                        consommées: Math.round(d.nutrition.kcal),
                        cible: d.targetCalories ?? 0,
                      }))}
                      margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number) => [`${value} kcal`, '']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="consommées"
                        name="Consommées"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cible"
                        name="Cible"
                        stroke="#22c55e"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-sm py-8 text-center">
                    Chargement des données…
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bar chart: calories brûlées + durée par jour */}
          {weekStats?.days?.length ? (
            <Card className="card-elevated border-border/80">
              <CardHeader>
                <CardTitle>Entraînements sur 7 jours</CardTitle>
                <CardDescription>Calories brûlées et durée (min)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart
                    data={weekStats.days.map((d) => ({
                      date: d.date.slice(5),
                      burnKcal: d.totalBurnKcal,
                      durationMin: d.totalDurationMin,
                    }))}
                    margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number, name: string) =>
                        [name === 'burnKcal' ? `${value} kcal` : `${value} min`, '']
                      }
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="burnKcal"
                      name="Calories brûlées"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="durationMin"
                      name="Durée (min)"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-elevated border-border/80">
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

        <Card className="card-elevated border-border/80">
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
      </main>
    </div>
  );
}
