"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSignIn(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        console.log("signIn data:", data);
        console.log("signIn error:", error);

        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        router.push("/");
    }

    async function handleSignUp(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const {
            data: { user },
            error,
        } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setLoading(false);
            setError(error.message);
            return;
        }

        if (!user) {
            setLoading(false);
            setError("Noe gikk galt ved opprettelse av bruker.");
            return;
        }

        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                display_name: displayName || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        setLoading(false);

        if (profileError) {
            console.error(profileError);
        }

        router.push("/");
    }

    return (
        <div className='flex min-h-screen items-center justify-center bg-slate-950'>
            <div className='w-full max-w-sm rounded-xl bg-slate-900 p-6 shadow-lg'>
                <h1 className='mb-4 text-center text-2xl font-semibold text-slate-50'>
                    Logg inn
                </h1>
                <form className='space-y-3'>
                    <input
                        type='email'
                        placeholder='E-post'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400'
                    />
                    <input
                        type='text'
                        placeholder='Visningsnavn'
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className='w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400'
                    />

                    <input
                        type='password'
                        placeholder='Passord'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400'
                    />
                    <button
                        onClick={handleSignIn}
                        disabled={loading}
                        className='w-full rounded-md bg-emerald-500 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60'
                    >
                        {loading ? "Logger inn..." : "Logg inn"}
                    </button>
                    <button
                        type='button'
                        onClick={handleSignUp}
                        disabled={loading}
                        className='w-full rounded-md border border-emerald-500 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-950 disabled:opacity-60'
                    >
                        Opprett bruker
                    </button>
                </form>
                {error && <p className='mt-3 text-sm text-red-400'>{error}</p>}
            </div>
        </div>
    );
}
