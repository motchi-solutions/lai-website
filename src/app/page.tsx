import { ContactSection } from "@/components/home/contact/contact-section";
import { EventsSection } from "@/components/home/sections/events-section";
import { HeroSection } from "@/components/home/sections/hero-section";
import { MethodSection } from "@/components/home/sections/method-section";
import { PastClientsSection } from "@/components/home/sections/past-clients-section";

export default function Home() {
    return (
        <main id="main-content">
            <HeroSection />
            <EventsSection />
            <PastClientsSection />
            <MethodSection />
            <ContactSection />
        </main>
    );
}
