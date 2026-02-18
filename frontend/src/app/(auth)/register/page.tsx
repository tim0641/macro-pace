'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const registerMutation = useMutation({
    mutationFn: () => apiClient.register(email, password),
    onSuccess: async () => {
      await apiClient.login(email, password);
      router.push('/dashboard');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-auth p-4">
      <Card className="w-full max-w-md card-elevated border-border/80 shadow-xl shadow-black/5">
        <CardHeader className="space-y-1 text-center pb-2">
          <CardTitle className="text-2xl font-semibold tracking-tight">Inscription</CardTitle>
          <CardDescription>Créez votre compte Macro Pace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/90">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-border/80 focus-visible:ring-primary/30"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/90">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-border/80 focus-visible:ring-primary/30"
                minLength={6}
                required
              />
            </div>
            {registerMutation.isError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {(registerMutation.error as Error).message}
              </p>
            )}
            <Button
              type="submit"
              className="w-full h-11 font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Inscription...' : "S'inscrire"}
            </Button>
            <p className="text-sm text-center text-muted-foreground pt-1">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline underline-offset-2">
                Se connecter
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
