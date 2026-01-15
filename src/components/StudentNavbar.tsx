'use client';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Link } from '@heroui/react';
import { useRouter, usePathname } from 'next/navigation';
import { clearStudentSession } from '@/lib/auth';

interface StudentNavbarProps {
    showLogout?: boolean;
}

export default function StudentNavbar({ showLogout = true }: StudentNavbarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        clearStudentSession();
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
                        className="font-medium"
                    >
                        <span className="mr-1.5">⌂</span> Home
                    </Link>
                </NavbarItem>
                <NavbarItem isActive={pathname === '/me/chat'}>
                    <Link
                        href="/me/chat"
                        color={pathname === '/me/chat' ? 'primary' : 'foreground'}
                        className="font-medium"
                    >
                        <span className="mr-1.5">✦</span> Numero AI
                    </Link>
                </NavbarItem>
            </NavbarContent>
            {showLogout && (
                <NavbarContent justify="end">
                    <Button
                        onPress={handleLogout}
                        variant="flat"
                        size="sm"
                    >
                        Logout
                    </Button>
                </NavbarContent>
            )}
        </Navbar>
    );
}
