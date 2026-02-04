'use client';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Link } from '@heroui/react';
import { useRouter, usePathname } from 'next/navigation';
import { clearStudentSession } from '@/lib/auth';
import { useStudentData } from '@/context/StudentDataContext';
import { Home, Sparkles, Calculator, LogOut } from 'lucide-react';

interface StudentNavbarProps {
    showLogout?: boolean;
}

export default function StudentNavbar({ showLogout = true }: StudentNavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { clearData } = useStudentData();

    const handleLogout = () => {
        clearStudentSession();
        clearData(); // Clear cached data from context and sessionStorage
        router.push('/login');
    };

    return (
        <Navbar maxWidth="xl" isBordered>
            <NavbarBrand>
                <p className="font-bold text-inherit text-lg">Numerosense</p>
            </NavbarBrand>
            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem isActive={pathname === '/me'}>
                    <Link
                        href="/me"
                        color={pathname === '/me' ? 'primary' : 'foreground'}
                        className="font-medium flex items-center gap-1.5"
                    >
                        <Home size={16} /> Home
                    </Link>
                </NavbarItem>
                <NavbarItem isActive={pathname === '/me/chat'}>
                    <Link
                        href="/me/chat"
                        color={pathname === '/me/chat' ? 'primary' : 'foreground'}
                        className="font-medium flex items-center gap-1.5"
                    >
                        <Sparkles size={16} /> Numero AI
                    </Link>
                </NavbarItem>
                <NavbarItem isActive={pathname === '/me/calculator'}>
                    <Link
                        href="/me/calculator"
                        color={pathname === '/me/calculator' ? 'primary' : 'foreground'}
                        className="font-medium flex items-center gap-1.5"
                    >
                        <Calculator size={16} /> Calculator
                    </Link>
                </NavbarItem>
            </NavbarContent>
            {showLogout && (
                <NavbarContent justify="end">
                    <Button
                        onPress={handleLogout}
                        variant="flat"
                        size="sm"
                        startContent={<LogOut size={14} />}
                    >
                        Logout
                    </Button>
                </NavbarContent>
            )}
        </Navbar>
    );
}
