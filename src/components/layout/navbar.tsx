"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Squash } from "hamburger-react";
import Image from "next/image";

const navigation = [
    { href: "#mission", label: "Our mission" },
    { href: "#events", label: "Our events" },
    { href: "#method", label: "Our method" },
    { href: "#contact", label: "Let's chat" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("mission");
    const animationFrame = useRef<number | null>(null);

    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setIsOpen(false);
        }
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    useEffect(() => {
        const sections = navigation
            .map(({ href }) => document.querySelector<HTMLElement>(href))
            .filter((section): section is HTMLElement => section !== null);

        function updateActiveSection() {
            const marker = window.scrollY + window.innerHeight * 0.38;
            let currentSection = sections[0]?.id ?? "mission";

            for (const section of sections) {
                if (section.offsetTop <= marker) currentSection = section.id;
            }

            setActiveSection(currentSection);
            animationFrame.current = null;
        }

        function scheduleUpdate() {
            if (animationFrame.current === null) {
                animationFrame.current = window.requestAnimationFrame(updateActiveSection);
            }
        }

        updateActiveSection();
        window.addEventListener("scroll", scheduleUpdate, { passive: true });
        window.addEventListener("resize", scheduleUpdate);

        return () => {
            window.removeEventListener("scroll", scheduleUpdate);
            window.removeEventListener("resize", scheduleUpdate);
            if (animationFrame.current !== null)
                window.cancelAnimationFrame(animationFrame.current);
        };
    }, []);

    function handleNavigation(event: MouseEvent<HTMLAnchorElement>, sectionId: string) {
        event.preventDefault();
        setActiveSection(sectionId);
        setIsOpen(false);

        document.getElementById(sectionId)?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth",
            block: "start",
        });
        window.history.replaceState(null, "", `#${sectionId}`);
    }

    return (
        <header className="sticky top-0 z-20 flex h-(--header-height) items-center justify-between gap-8 border-b border-lai-blue/10 bg-paper/95 px-5 backdrop-blur-sm lg:px-12 2xl:px-16">
            <a
                className="fixed top-4 left-4 z-100 translate-y-[-200%] rounded-lg bg-ink px-4 py-2.5 text-white focus:translate-y-0"
                href="#main-content"
            >
                Skip to main content
            </a>
            <a
                className="grid size-12 shrink-0 place-items-center p-1 no-underline sm:size-14 lg:size-[calc(var(--header-height)-1.5rem)] lg:p-0.5"
                href="#mission"
                aria-label="Lai home"
                onClick={(event) => handleNavigation(event, "mission")}
            >
                <Image
                    src="/brand/lai-logo.png"
                    alt=""
                    width={1419}
                    height={1434}
                    priority
                    sizes="(max-width: 1024px) 56px, 128px"
                    className="block h-auto w-full"
                />
            </a>
            <nav className="hidden w-full max-w-5xl pl-16 lg:block" aria-label="Primary navigation">
                <ul className="mt-3 flex list-none justify-between border-t border-nav/60 pt-0 pl-32">
                    {navigation.map((item) => (
                        <li className="min-w-0 flex-[1_1_25%] text-center" key={item.href}>
                            <a
                                className={`-mt-1 block text-base no-underline transition duration-300 hover:text-ink xl:text-lg ${
                                    activeSection === item.href.slice(1) ? "text-ink" : "text-nav"
                                }`}
                                href={item.href}
                                aria-current={
                                    activeSection === item.href.slice(1) ? "location" : undefined
                                }
                                onClick={(event) => handleNavigation(event, item.href.slice(1))}
                            >
                                <span
                                    className={`mx-auto mb-1 block size-2.5 rounded-full border-2 bg-paper transition duration-300 ${
                                        activeSection === item.href.slice(1)
                                            ? "scale-110 border-ink bg-ink ring-2 ring-ink/10 ring-offset-2 ring-offset-paper"
                                            : "border-nav"
                                    }`}
                                    aria-hidden="true"
                                />
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="relative z-30 lg:hidden">
                <Squash
                    toggled={isOpen}
                    toggle={setIsOpen}
                    color="#06122f"
                    size={25}
                    label={isOpen ? "Close menu" : "Open menu"}
                />
            </div>
            <nav
                className={`absolute top-full right-5 w-[calc(100%-2.5rem)] max-w-xs rounded-2xl border border-line bg-paper px-5 pt-2 pb-5 shadow-xl transition duration-200 lg:hidden ${
                    isOpen
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-3 opacity-0"
                }`}
                aria-label="Mobile navigation"
                aria-hidden={!isOpen}
                data-open={isOpen}
            >
                <ul className="m-0 block list-none p-0">
                    {navigation.map((item, index) => (
                        <li className="border-b border-line last:border-b-0" key={item.href}>
                            <a
                                className={`flex min-h-14 items-center gap-4 text-lg no-underline transition duration-200 ${
                                    activeSection === item.href.slice(1)
                                        ? "translate-x-1 text-ink"
                                        : "text-nav"
                                }`}
                                href={item.href}
                                aria-current={
                                    activeSection === item.href.slice(1) ? "location" : undefined
                                }
                                onClick={(event) => handleNavigation(event, item.href.slice(1))}
                                tabIndex={isOpen ? 0 : -1}
                            >
                                <span
                                    className={`text-xs tracking-widest ${
                                        activeSection === item.href.slice(1)
                                            ? "font-semibold text-ink"
                                            : "text-nav"
                                    }`}
                                >
                                    0{index + 1}
                                </span>
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}
