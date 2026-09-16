import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { ThemeToggle } from '@/components/theme-toggle';

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          MacroByte
        </Link>

        {user && (
          <nav className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/foods">
              <Button variant="ghost" size="sm">Foods</Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm">Profile</Button>
            </Link>
            <ThemeToggle />
            <form action="/auth/logout">
              <Button type="submit" variant="outline" size="sm">
                Log Out
              </Button>
            </form>
          </nav>
        )}
      </div>
    </header>
  );
}
