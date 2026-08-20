import { ContactSection } from "@/components/home/contact-section";
import { EventsSection } from "@/components/home/events-section";
import { HeroSection } from "@/components/home/hero-section";
import { MethodSection } from "@/components/home/method-section";
import { PastClientsSection } from "@/components/home/past-clients-section";

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
