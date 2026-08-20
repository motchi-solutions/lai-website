"use client";

import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";

type AnimatedSectionProps = ComponentPropsWithoutRef<"section">;

export function AnimatedSection({ children, className = "", ...props }: AnimatedSectionProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setIsVisible(true);
                observer.unobserve(entry.target);
            },
            { rootMargin: "0px 0px -12%", threshold: 0.08 },
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className={`section-reveal ${isVisible ? "is-visible" : ""} ${className}`}
            {...props}
        >
            {children}
        </section>
    );
}
