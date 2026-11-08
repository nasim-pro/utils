"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    {
        name: "Home",
        href: "/",
    },
    {
        name: "StockJump",
        href: "/apps/stockjump",
    },
    {
        name: "DoneLog",
        href: "/apps/done-log",
    },
    {
        name: "Image Tools",
        href: "/tools",
    },
];

export default function Navbar() {
    const pathname = usePathname();

    function isActive(href: string): boolean {
        if (href === "/") {
            return pathname === "/";
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link href="/" className="logo">
                    GrowUpNow
                </Link>

                <div className="nav-links">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-link ${isActive(item.href) ? "active-link" : ""
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
