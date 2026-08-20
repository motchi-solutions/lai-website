"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Squash } from "hamburger-react";
import Image from "next/image";

const navigation = [
    { href: "#mission", label: "Our mission" },
    { href: "#events", label: "Our events" },
    { href: "#method", label: "Our method" },
    { href: "#contact", label: "Let’s chat" },
];

export function SiteHeader() {
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
        <header className="site-header">
            <a
                className="wordmark"
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
                    sizes="(max-width: 900px) 72px, 96px"
                />
            </a>
            <nav className="desktop-navigation" aria-label="Primary navigation">
                <ul>
                    {navigation.map((item) => (
                        <li key={item.href}>
                            <a
                                href={item.href}
                                aria-current={
                                    activeSection === item.href.slice(1) ? "location" : undefined
                                }
                                onClick={(event) => handleNavigation(event, item.href.slice(1))}
                            >
                                <span aria-hidden="true" />
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="menu-toggle">
                <Squash
                    toggled={isOpen}
                    toggle={setIsOpen}
                    color="#06122f"
                    size={25}
                    label={isOpen ? "Close menu" : "Open menu"}
                />
            </div>
            <nav
                className="mobile-navigation"
                aria-label="Mobile navigation"
                aria-hidden={!isOpen}
                data-open={isOpen}
            >
                <ul>
                    {navigation.map((item, index) => (
                        <li key={item.href}>
                            <a
                                href={item.href}
                                aria-current={
                                    activeSection === item.href.slice(1) ? "location" : undefined
                                }
                                onClick={(event) => handleNavigation(event, item.href.slice(1))}
                                tabIndex={isOpen ? 0 : -1}
                            >
                                <span>0{index + 1}</span>
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}
