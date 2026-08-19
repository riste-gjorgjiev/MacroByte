import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to MacroByte</CardTitle>
          <CardDescription>Logged in as {user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your nutrition tracking dashboard is coming soon!
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/foods">Search Foods</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/profile">Profile</Link>
            </Button>
            <form action="/auth/logout">
              <Button type="submit" variant="destructive" className="w-full">
                Log Out
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
