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

    const params = await searchParams;
    const date = params.date || new Date().toISOString().split('T')[0];

    return (
        <div className="container mx-auto max-w-4xl p-4 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Nutrition Dashboard</h1>
                    <DateNavigator currentDate={date}/>
                </div>
                <Button asChild>
                    <Link href="/foods">
                        + Add Food
                    </Link>
                </Button>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-3">Logged Foods</h2>
                <DailyLog date={date}/>
            </div>

            <NutrientDisplay date={date}/>


        </div>
    );
}
