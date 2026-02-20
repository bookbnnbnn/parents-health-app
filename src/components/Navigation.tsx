'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, PlusCircle } from 'lucide-react'

export default function Navigation() {
    const pathname = usePathname()

    if (pathname === '/login') return null

    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 z-50">
            <div className="flex justify-around items-center h-20">
                <Link
                    href="/"
                    className={`flex flex-col items-center flex-1 py-4 ${pathname === '/' ? 'text-red-600' : 'text-gray-500'}`}
                >
                    <Home size={32} />
                    <span className="text-sm font-medium mt-1">主頁</span>
                </Link>
                <Link
                    href="/add"
                    className="flex flex-col items-center flex-1 -mt-8"
                >
                    <div className="bg-red-600 rounded-full p-4 shadow-lg text-white hover:bg-red-700 transition">
                        <PlusCircle size={40} />
                    </div>
                </Link>
                <Link
                    href="/history"
                    className={`flex flex-col items-center flex-1 py-4 ${pathname === '/history' ? 'text-red-600' : 'text-gray-500'}`}
                >
                    <List size={32} />
                    <span className="text-sm font-medium mt-1">歷史</span>
                </Link>
            </div>
        </nav>
    )
}
