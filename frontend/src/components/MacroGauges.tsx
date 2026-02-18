'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { DayStats } from '@/lib/api/types';

interface MacroGaugeProps {
  label: string;
  unit: string;
  consumed: number;
  target: number;
  isOverTarget?: boolean;
}

function MacroGauge({ label, unit, consumed, target, isOverTarget }: MacroGaugeProps) {
  const percentage = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  const overTarget = consumed > target;
  const displayConsumed = Math.round(consumed);
  const displayTarget = Math.round(target);
  const excess = overTarget ? Math.round(consumed - target) : 0;
  
  // Déterminer la variante de couleur selon le pourcentage
  let variant: 'default' | 'success' | 'warning' | 'danger' = 'default';
  if (overTarget) {
    variant = 'danger';
  } else if (percentage >= 90) {
    variant = 'warning';
  } else if (percentage >= 70) {
    variant = 'success';
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className={overTarget ? 'text-amber-600 font-semibold' : ''}>
            {displayConsumed}
            {overTarget && ` (+${excess})`}
          </span>
          <span className="text-muted-foreground">/ {displayTarget}</span>
          <span className="text-muted-foreground text-xs">{unit}</span>
        </div>
      </div>
      <Progress value={percentage} max={100} variant={variant} />
      <div className="text-xs text-muted-foreground text-right">
        {percentage.toFixed(0)}%
      </div>
    </div>
  );
}

interface MacroGaugesProps {
  stats: DayStats | null;
  isLoading?: boolean;
}

export function MacroGauges({ stats, isLoading }: MacroGaugesProps) {
  if (isLoading) {
    return (
      <Card className="card-elevated border-border/80">
        <CardHeader>
          <CardTitle>Objectifs du jour</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const hasTargets = stats.targets !== null;
  const nutrition = stats.nutrition;
  const targets = stats.targets;

  if (!hasTargets) {
    return (
      <Card className="card-elevated border-border/80">
        <CardHeader>
          <CardTitle>Objectifs du jour</CardTitle>
          <CardDescription>
            Complétez votre profil pour voir vos objectifs personnalisés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/profile">
            <Button className="w-full">Compléter votre profil</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated border-border/80">
      <CardHeader>
        <CardTitle>Objectifs du jour</CardTitle>
        <CardDescription>Progression de vos macros et nutriments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <MacroGauge
          label="Calories"
          unit="kcal"
          consumed={nutrition.kcal}
          target={targets.targetCalories}
          isOverTarget={nutrition.kcal > targets.targetCalories}
        />
        <MacroGauge
          label="Protéines"
          unit="g"
          consumed={nutrition.protein}
          target={targets.proteinG}
          isOverTarget={nutrition.protein > targets.proteinG}
        />
        <MacroGauge
          label="Glucides"
          unit="g"
          consumed={nutrition.carbs}
          target={targets.carbsG}
          isOverTarget={nutrition.carbs > targets.carbsG}
        />
        <MacroGauge
          label="Lipides"
          unit="g"
          consumed={nutrition.fat}
          target={targets.fatG}
          isOverTarget={nutrition.fat > targets.fatG}
        />
        <MacroGauge
          label="Sucres"
          unit="g"
          consumed={nutrition.sugar}
          target={targets.sugarTargetG}
          isOverTarget={nutrition.sugar > targets.sugarTargetG}
        />
        <MacroGauge
          label="Fibres"
          unit="g"
          consumed={nutrition.fiber}
          target={targets.fiberTargetG}
          isOverTarget={nutrition.fiber > targets.fiberTargetG}
        />
      </CardContent>
    </Card>
  );
}
