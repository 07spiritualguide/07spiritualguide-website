'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@heroui/react';
import { supabase } from '@/lib/supabase';
import { getStudentSession } from '@/lib/auth';

export default function HomePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthAndRedirect();
    }, []);

    const checkAuthAndRedirect = async () => {
        const session = getStudentSession();

        if (!session) {
            router.push('/login');
            return;
        }

        // Check if profile is complete
        const { data: student } = await supabase
            .from('students')
            .select('profile_complete')
            .eq('id', session.id)
            .single();

        if (student?.profile_complete) {
            router.push('/me');
        } else {
            router.push('/details');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Spinner size="lg" />
        </div>
    );
}
