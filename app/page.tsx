import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to MacroByte</CardTitle>
          <CardDescription>Logged in as {user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your nutrition tracking dashboard is coming in Stage 7!
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            For now, you can search for foods and view their nutritional information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
