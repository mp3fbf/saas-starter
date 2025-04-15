/**
 * @description
 * Profile page for the authenticated user, displaying user information
 * and account settings.
 */
import React from 'react';
import { getUserWithSubscription } from '@/lib/db/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { signOut } from '../actions';

export default async function ProfilePage() {
  const userData = await getUserWithSubscription();
  
  if (!userData) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Perfil</h1>
        <p>Não foi possível carregar os dados do usuário.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Seu Perfil</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Email:</span>
                <p>{userData.email}</p>
              </div>
              {userData.name && (
                <div>
                  <span className="font-medium">Nome:</span>
                  <p>{userData.name}</p>
                </div>
              )}
              {/* Add more user fields as needed */}
            </div>
          </CardContent>
        </Card>
        
        {/* Subscription Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Status da Assinatura:</span>
                <p className="capitalize">{userData.account?.subscriptionStatus || 'Gratuito'}</p>
              </div>
              {userData.account?.planName && (
                <div>
                  <span className="font-medium">Plano:</span>
                  <p>{userData.account.planName}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <Button variant="outline" className="w-full" asChild>
                <a href="/dashboard">Gerenciar Assinatura</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Account Actions */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Ações da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <form action={signOut}>
                <Button type="submit" variant="destructive">
                  Sair da Conta
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 