import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          MacroByte
        </Link>

        {user && (
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/foods">Foods</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/profile">Profile</Link>
            </Button>
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
