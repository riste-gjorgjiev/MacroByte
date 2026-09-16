import {createClient} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import {NutrientDisplay} from '@/components/dashboard/nutrient-display';
import {DailyLog} from '@/components/dashboard/daily-log';
import {DateNavigator} from '@/components/dashboard/date-navigator';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Plus} from 'lucide-react';

export default async function HomePage({searchParams}: { searchParams: Promise<{ date?: string }> }) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Check if user has completed onboarding
    const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

    if (!profile?.onboarding_completed) {
        redirect('/onboarding');
    }

    const params = await searchParams;
    const date = params.date || new Date().toISOString().split('T')[0];

    return (
        <div className="container mx-auto max-w-4xl p-4 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Nutrition Dashboard</h1>
                    <DateNavigator currentDate={date}/>
                </div>
                <Link href="/foods">
                    <Button>+ Add Food</Button>
                </Link>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-3">Logged Foods</h2>
                <DailyLog date={date}/>
            </div>

            <NutrientDisplay date={date}/>


        </div>
    );
}
