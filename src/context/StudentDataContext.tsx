'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getStudentSession, StudentSession } from '@/lib/auth';
import { MahadashaEntry } from '@/lib/mahadasha';
import { AntardashaEntry } from '@/lib/antardasha';
import { YearPratyantardasha } from '@/lib/pratyantardasha';
import { extractNameParts, calculateNameNumber } from '@/lib/name-numerology';

interface StudentProfile {
    full_name: string;
    date_of_birth: string;
    gender: string;
}

interface BasicInfo {
    root_number: number | null;
    supportive_numbers: string[] | null;
    destiny_number: number | null;
    lucky_number: number | null;
    zodiac_sign: string | null; // Birth zodiac sign
    favourable_zodiac_sign: string | null; // Favorable zodiac from numerology
    lucky_color: string | null;
    lucky_direction: string | null;
    positive_traits: string[] | null;
    negative_traits: string[] | null;
    lord: string | null;
    lucky_dates: string[] | null;
    favourable_profession: string[] | null;
    favorable_days: string[] | null;
    favorable_alphabets: string[] | null;
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
    name_number: number | null;
}

interface StudentData {
    session: StudentSession | null;
    profile: StudentProfile | null;
    basicInfo: BasicInfo | null;
    mahadashaTimeline: MahadashaEntry[] | null;
    antardashaTimeline: AntardashaEntry[] | null;
    pratyantardashaTimeline: YearPratyantardasha[] | null;
    isTrialExpired: boolean;
}

interface StudentDataContextType {
    data: StudentData;
    loading: boolean;
    error: string | null;
    fetchData: () => Promise<void>;
    clearData: () => void;
    setMahadashaTimeline: (timeline: MahadashaEntry[]) => void;
    setAntardashaTimeline: (timeline: AntardashaEntry[]) => void;
    setPratyantardashaTimeline: (timeline: YearPratyantardasha[]) => void;
    setIsTrialExpired: (expired: boolean) => void;
}

const initialData: StudentData = {
    session: null,
    profile: null,
    basicInfo: null,
    mahadashaTimeline: null,
    antardashaTimeline: null,
    pratyantardashaTimeline: null,
    isTrialExpired: false,
};

const StudentDataContext = createContext<StudentDataContextType | null>(null);

// Session storage key for caching
const CACHE_KEY = 'student_data_cache';

export function StudentDataProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<StudentData>(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    // Load cached data from sessionStorage on mount
    useEffect(() => {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const parsedData = JSON.parse(cached);
                setData(parsedData);
                setHasFetched(true);
                setLoading(false);
            } catch {
                // Invalid cache, will fetch fresh
            }
        }
    }, []);

    // Save data to sessionStorage whenever it changes
    useEffect(() => {
        if (data.session) {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        }
    }, [data]);

    const fetchData = useCallback(async () => {
        // Skip if already fetched and have data
        if (hasFetched && data.session) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const studentSession = getStudentSession();
            if (!studentSession) {
                setLoading(false);
                return;
            }

            // Fetch profile data
            const { data: student, error: profileError } = await supabase
                .from('students')
                .select('full_name, date_of_birth, gender, profile_complete, trial_ends_at')
                .eq('id', studentSession.id)
                .single();

            if (profileError) {
                setError('Failed to fetch profile');
                setLoading(false);
                return;
            }

            const profile: StudentProfile = {
                full_name: student.full_name,
                date_of_birth: student.date_of_birth,
                gender: student.gender,
            };

            // Check trial expiry
            const isTrialExpired = student.trial_ends_at && new Date(student.trial_ends_at) < new Date();

            // Fetch basic_info data
            const { data: info } = await supabase
                .from('basic_info')
                .select('*')
                .eq('student_id', studentSession.id)
                .single();

            let basicInfo: BasicInfo | null = null;
            if (info) {
                basicInfo = info;

                // Check if name numerology is missing for existing users
                if (!info.first_name || !info.name_number) {
                    const { firstName, middleName, lastName } = extractNameParts(student.full_name);
                    const nameNumber = calculateNameNumber(firstName, middleName, lastName);

                    // Update basic_info with name numerology
                    await supabase
                        .from('basic_info')
                        .update({
                            first_name: firstName,
                            middle_name: middleName || null,
                            last_name: lastName,
                            name_number: nameNumber,
                        })
                        .eq('student_id', studentSession.id);

                    basicInfo = {
                        ...info,
                        first_name: firstName,
                        middle_name: middleName || null,
                        last_name: lastName,
                        name_number: nameNumber,
                    };
                }
            }

            // Fetch mahadasha data
            const { data: mahadasha } = await supabase
                .from('mahadasha')
                .select('timeline')
                .eq('student_id', studentSession.id)
                .maybeSingle();

            // Fetch antardasha data
            const { data: antardasha } = await supabase
                .from('antardasha')
                .select('timeline')
                .eq('student_id', studentSession.id)
                .maybeSingle();

            // Fetch pratyantardasha data
            const { data: pratyantardasha } = await supabase
                .from('pratyantardasha')
                .select('timeline')
                .eq('student_id', studentSession.id)
                .maybeSingle();

            setData({
                session: studentSession,
                profile,
                basicInfo,
                mahadashaTimeline: mahadasha?.timeline as MahadashaEntry[] || null,
                antardashaTimeline: antardasha?.timeline as AntardashaEntry[] || null,
                pratyantardashaTimeline: pratyantardasha?.timeline as YearPratyantardasha[] || null,
                isTrialExpired: !!isTrialExpired,
            });
            setHasFetched(true);
        } catch (err) {
            console.error('Error fetching student data:', err);
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, [hasFetched, data.session]);

    const clearData = useCallback(() => {
        setData(initialData);
        setHasFetched(false);
        sessionStorage.removeItem(CACHE_KEY);
    }, []);

    const setMahadashaTimeline = useCallback((timeline: MahadashaEntry[]) => {
        setData(prev => ({ ...prev, mahadashaTimeline: timeline }));
    }, []);

    const setAntardashaTimeline = useCallback((timeline: AntardashaEntry[]) => {
        setData(prev => ({ ...prev, antardashaTimeline: timeline }));
    }, []);

    const setPratyantardashaTimeline = useCallback((timeline: YearPratyantardasha[]) => {
        setData(prev => ({ ...prev, pratyantardashaTimeline: timeline }));
    }, []);

    const setIsTrialExpired = useCallback((expired: boolean) => {
        setData(prev => ({ ...prev, isTrialExpired: expired }));
    }, []);

    return (
        <StudentDataContext.Provider
            value={{
                data,
                loading,
                error,
                fetchData,
                clearData,
                setMahadashaTimeline,
                setAntardashaTimeline,
                setPratyantardashaTimeline,
                setIsTrialExpired,
            }}
        >
            {children}
        </StudentDataContext.Provider>
    );
}

export function useStudentData() {
    const context = useContext(StudentDataContext);
    if (!context) {
        throw new Error('useStudentData must be used within a StudentDataProvider');
    }
    return context;
}
