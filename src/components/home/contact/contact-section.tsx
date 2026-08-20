import Image from "next/image";

import { ContactForm } from "./contact-form";
import { section, sectionInner } from "../shared/section-styles";

export function ContactSection() {
    return (
        <section
            className={`${section} relative items-start pb-0!`}
            id="contact"
            aria-labelledby="contact-title"
        >
            <div
                className={`${sectionInner} relative z-2 grid items-start gap-10 lg:min-h-144 lg:grid-cols-2 lg:gap-16`}
            >
                <div className="min-w-0">
                    <h2
                        className="font-display text-[clamp(4rem,6vw,6rem)] leading-[0.94] font-normal tracking-wide text-lai-blue"
                        id="contact-title"
                    >
                        <span className="block">Share your vision.</span>
                        <span className="mt-2 block">We&apos;ll handle the rest.</span>
                    </h2>
                </div>
                <ContactForm />
            </div>
            <Image
                className="relative z-1 mx-auto mt-16 h-auto w-full max-w-md opacity-95 lg:absolute lg:bottom-0 lg:left-16 lg:m-0 lg:w-2/5 lg:max-w-xl"
                src="/images/textures/contact-loop.png"
                alt=""
                width={604}
                height={568}
                sizes="(max-width: 900px) 90vw, 38vw"
                aria-hidden="true"
            />
        </section>
    );
}
