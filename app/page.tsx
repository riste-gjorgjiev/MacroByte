import {createClient} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import {NutrientDisplay} from '@/components/dashboard/nutrient-display';
import {DailyLog} from '@/components/dashboard/daily-log';
import {DateNavigator} from '@/components/dashboard/date-navigator';
import {WaterTracker} from '@/components/water/water-tracker';
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
        .select('onboarding_completed, water_goal_ml')
        .eq('id', user.id)
        .single();

    if (!profile?.onboarding_completed) {
        redirect('/onboarding');
    }

    const params = await searchParams;
    const date = params.date || new Date().toISOString().split('T')[0];
    const waterGoal = profile?.water_goal_ml || 2000;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Nutrition Dashboard</h1>
                    <DateNavigator currentDate={date}/>
                </div>
                <Link href="/foods">
                    <Button className="bg-gray-900 hover:bg-gray-800 text-white">+ Add Food</Button>
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Logged Foods (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Today's Meals</h2>
                        <DailyLog date={date}/>
                    </div>
                </div>

                {/* Right Column - Summary Widgets (1/3 width) */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Water Intake</h2>
                        <WaterTracker date={date} goalMl={waterGoal}/>
                    </div>
                </div>
            </div>

            <NutrientDisplay date={date}/>
        </div>
    );
}
