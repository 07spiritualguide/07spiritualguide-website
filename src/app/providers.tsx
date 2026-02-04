'use client';

import { HeroUIProvider } from "@heroui/react";
import { ReactNode } from "react";
import { StudentDataProvider } from "@/context/StudentDataContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <HeroUIProvider>
      <StudentDataProvider>
        {children}
      </StudentDataProvider>
    </HeroUIProvider>
  );
}
