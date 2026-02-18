'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sédentaire (peu ou pas d\'exercice)',
  light: 'Léger (1-3 j/sem)',
  moderate: 'Modéré (3-5 j/sem)',
  very: 'Intense (6-7 j/sem)',
  athlete: 'Athlète (2x/j)',
};

const GOAL_LABELS: Record<string, string> = {
  maintain: 'Maintien',
  lose: 'Perte de poids',
  gain: 'Prise de masse',
};

const GOAL_RATE_LABELS: Record<string, string> = {
  slow: 'Lent',
  medium: 'Moyen',
  fast: 'Rapide',
};

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    sex: '',
    birthdate: '',
    heightCm: '',
    weightKg: '',
    activityLevel: '',
    goal: '',
    goalRate: '',
  });

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.getMe(),
  });

  const { data: targets } = useQuery({
    queryKey: ['targets'],
    queryFn: () => apiClient.getTargets(),
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const p = user?.profile;
    if (!p) return;
    setForm({
      sex: p.sex ?? '',
      birthdate: p.birthdate ? p.birthdate.toString().slice(0, 10) : '',
      heightCm: p.heightCm != null ? String(p.heightCm) : '',
      weightKg: p.weightKg != null ? String(p.weightKg) : '',
      activityLevel: p.activityLevel ?? '',
      goal: p.goal ?? '',
      goalRate: p.goalRate ?? '',
    });
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: () =>
      apiClient.updateProfile({
        ...(form.sex && { sex: form.sex as 'male' | 'female' }),
        ...(form.birthdate && { birthdate: form.birthdate }),
        ...(form.heightCm && { heightCm: parseFloat(form.heightCm) }),
        ...(form.weightKg && { weightKg: parseFloat(form.weightKg) }),
        ...(form.activityLevel && { activityLevel: form.activityLevel as any }),
        ...(form.goal && { goal: form.goal as any }),
        ...(form.goalRate && { goalRate: form.goalRate as any }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      queryClient.invalidateQueries({ queryKey: ['dayStats'] });
      queryClient.invalidateQueries({ queryKey: ['weekStats'] });
    },
  });

  return (
    <div className="min-h-screen">
      <header className="nav-bar sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight">Macro Pace</h1>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard"><Button variant="ghost" size="sm">Tableau de bord</Button></Link>
            <Link href="/profile"><Button variant="outline" size="sm" className="border-primary/50 bg-primary/5">Profil</Button></Link>
            <Link href="/foods"><Button variant="outline" size="sm">Aliments</Button></Link>
            <Link href="/log/meal"><Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">+ Repas</Button></Link>
            <Link href="/log/workout"><Button variant="outline" size="sm">+ Entraînement</Button></Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Mon profil</h2>
          <p className="text-sm text-muted-foreground">Cibles caloriques et macros</p>
        </div>

      <Card className="card-elevated border-border/80">
        <CardHeader>
          <CardTitle>Informations</CardTitle>
          <CardDescription>
            Renseignez votre profil pour calculer vos cibles caloriques et macros.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sexe</Label>
              <Select value={form.sex} onValueChange={(v) => setForm({ ...form, sex: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Homme</SelectItem>
                  <SelectItem value="female">Femme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date de naissance</Label>
              <Input
                type="date"
                value={form.birthdate}
                onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Taille (cm)</Label>
              <Input
                type="number"
                min={100}
                max={250}
                value={form.heightCm}
                onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Poids (kg)</Label>
              <Input
                type="number"
                min={30}
                max={300}
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Niveau d&apos;activité</Label>
              <Select
                value={form.activityLevel}
                onValueChange={(v) => setForm({ ...form, activityLevel: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Objectif</Label>
              <Select value={form.goal} onValueChange={(v) => setForm({ ...form, goal: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GOAL_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(form.goal === 'lose' || form.goal === 'gain') && (
              <div className="space-y-2 col-span-2">
                <Label>Vitesse (objectif)</Label>
                <Select
                  value={form.goalRate}
                  onValueChange={(v) => setForm({ ...form, goalRate: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GOAL_RATE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          {updateMutation.isError && (
            <p className="text-sm text-destructive">
              {(updateMutation.error as Error).message}
            </p>
          )}
        </CardContent>
      </Card>

      {targets && (
        <Card className="card-elevated border-border/80">
          <CardHeader>
            <CardTitle>Cibles calculées</CardTitle>
            <CardDescription>
              BMR (Mifflin-St Jeor), TDEE = BMR × facteur d&apos;activité, puis cible selon objectif.
              Macros : protéines (g/kg), lipides 0,8 g/kg, glucides = reste.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>BMR</div>
              <div className="font-medium">{targets.bmr} kcal</div>
              <div>TDEE</div>
              <div className="font-medium">{targets.tdee} kcal</div>
              <div>Cible calories</div>
              <div className="font-medium">{targets.targetCalories} kcal/jour</div>
              <div>Protéines</div>
              <div className="font-medium">{targets.proteinG} g</div>
              <div>Glucides</div>
              <div className="font-medium">{targets.carbsG} g</div>
              <div>Lipides</div>
              <div className="font-medium">{targets.fatG} g</div>
            </div>
          </CardContent>
        </Card>
      )}

      {user?.profile && !targets && (
        <p className="text-sm text-muted-foreground">
          Complétez tous les champs (sexe, date de naissance, taille, poids, activité, objectif)
          pour afficher vos cibles.
        </p>
      )}
      </main>
    </div>
  );
}
