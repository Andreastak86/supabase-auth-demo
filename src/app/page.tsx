"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

type Profile = {
    id: string;
    display_name: string | null;
    created_at?: string;
    updated_at?: string;
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            setUser(user);

            const { data: profile, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single<Profile>();

            if (error) {
                console.error("Feil ved henting av profil:", error.message);
            } else {
                setProfile(profile);
            }

            setLoading(false);
        };

        void load();
    }, [router]);

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/login");
    }

    if (loading) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-slate-950 text-slate-200'>
                Laster dashboard...
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-slate-950 text-slate-100'>
            <header className='flex items-center justify-between border-b border-slate-800 px-6 py-4'>
                <h1 className='text-xl font-semibold'>
                    Velkommen til Supabase-dashboard
                </h1>
                <div className='flex items-center gap-3'>
                    <span className='text-sm text-slate-400'>
                        {user?.email}
                    </span>
                    <span className='text-sm text-slate-400'>
                        {profile?.display_name ?? user?.email}
                    </span>

                    <button
                        onClick={handleLogout}
                        className='rounded-md border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800'
                    >
                        Logg ut
                    </button>
                </div>
            </header>

            <main className='px-6 py-6'>
                <p className='text-sm text-slate-300'>
                    Her kan vi knytte sammen andre tabeller, eller andre
                    tjenester som vi knytter sammen med din supabase-bruker.
                </p>
            </main>
        </div>
    );
}
