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
      router.push('/dashboard');
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ajouter un entraînement</h1>
        <Link href="/dashboard">
          <Button variant="outline">Retour</Button>
        </Link>
      </div>

      <Card>
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
            className="w-full"
          >
            {createMutation.isPending ? 'Création...' : 'Créer l\'entraînement'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
