'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LogWorkoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [type, setType] = useState<'run' | 'strength'>('run');
  const [startedAt, setStartedAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [durationMin, setDurationMin] = useState('');
  const [rpe, setRpe] = useState('');
  const [notes, setNotes] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [avgPaceSecKm, setAvgPaceSecKm] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
      router.push('/login');
    }
  }, [router]);

  const createMutation = useMutation({
    mutationFn: () =>
      apiClient.createWorkout({
        startedAt: new Date(startedAt).toISOString(),
        type,
        durationMin: parseInt(durationMin),
        rpe: rpe ? parseInt(rpe) : undefined,
        notes: notes || undefined,
        distanceKm: type === 'run' && distanceKm ? parseFloat(distanceKm) : undefined,
        avgPaceSecKm: type === 'run' && avgPaceSecKm ? parseFloat(avgPaceSecKm) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['dayStats'] });
      queryClient.invalidateQueries({ queryKey: ['weekStats'] });
      router.push('/dashboard');
    },
  });

  return (
    <div className="min-h-screen">
      <header className="nav-bar sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight">Macro Pace</h1>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard"><Button variant="ghost" size="sm">Tableau de bord</Button></Link>
            <Link href="/profile"><Button variant="outline" size="sm">Profil</Button></Link>
            <Link href="/foods"><Button variant="outline" size="sm">Aliments</Button></Link>
            <Link href="/log/meal"><Button variant="outline" size="sm">+ Repas</Button></Link>
            <Link href="/log/workout"><Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">+ Entraînement</Button></Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Ajouter un entraînement</h2>
          <p className="text-sm text-muted-foreground">Course ou musculation</p>
        </div>

      <Card className="card-elevated border-border/80">
        <CardHeader>
          <CardTitle>Nouvel entraînement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'run' | 'strength')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="run">Course</SelectItem>
                <SelectItem value="strength">Musculation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date et heure de début</Label>
            <Input
              type="datetime-local"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Durée (minutes)</Label>
            <Input
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              required
            />
          </div>

          {type === 'run' && (
            <>
              <div className="space-y-2">
                <Label>Distance (km)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Allure moyenne (secondes/km)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={avgPaceSecKm}
                  onChange={(e) => setAvgPaceSecKm(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>RPE (1-10, optionnel)</Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={rpe}
              onChange={(e) => setRpe(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (optionnel)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Entraînement matinal"
            />
          </div>

          {createMutation.isError && (
            <p className="text-sm text-destructive">
              {(createMutation.error as Error).message}
            </p>
          )}

          <Button
            onClick={() => createMutation.mutate()}
            disabled={!durationMin || createMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {createMutation.isPending ? 'Création...' : 'Créer l\'entraînement'}
          </Button>
        </CardContent>
      </Card>
      </main>
    </div>
  );
}
