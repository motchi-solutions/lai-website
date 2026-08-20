"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <header className="site-header">
      <a className="wordmark" href="#mission" aria-label="Lai home" onClick={() => setIsOpen(false)}>
        <Image src="/brand/lai-logo.png" alt="" width={1419} height={1434} priority sizes="(max-width: 900px) 72px, 96px" />
      </a>
      <nav className="desktop-navigation" aria-label="Primary navigation">
        <ul>{navigation.map((item) => <li key={item.href}><a href={item.href}><span aria-hidden="true" />{item.label}</a></li>)}</ul>
      </nav>
      <div className="menu-toggle">
        <Squash toggled={isOpen} toggle={setIsOpen} color="#06122f" size={25} label={isOpen ? "Close menu" : "Open menu"} />
      </div>
      <nav className="mobile-navigation" aria-label="Mobile navigation" aria-hidden={!isOpen} data-open={isOpen}>
        <ul>{navigation.map((item, index) => <li key={item.href}><a href={item.href} onClick={() => setIsOpen(false)} tabIndex={isOpen ? 0 : -1}><span>0{index + 1}</span>{item.label}</a></li>)}</ul>
      </nav>
    </header>
  );
}
