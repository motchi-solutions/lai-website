import Image from "next/image";

import { AnimatedSection } from "../shared/animated-section";
import { button, displayTitle, lede, section, sectionInner } from "../shared/section-styles";

export function HeroSection() {
    return (
        <AnimatedSection className={section} id="mission" aria-labelledby="mission-title">
            <div
                className={`${sectionInner} grid items-start gap-8 sm:gap-10 lg:w-[90%] lg:grid-cols-2 lg:gap-2`}
            >
                <div className="min-w-0 lg:pl-4">
                    <p className="mb-6 inline-block rounded-2xl border-2 border-ink px-5 py-2.5 text-base sm:mb-8 lg:text-lg">
                        Now Serving the GTA
                    </p>
                    <h1 className={`${displayTitle} lg:my-12`} id="mission-title">
                        A drink menu <br className="hidden lg:block" />
                        catered to you.
                    </h1>
                    <p className={lede}>
                        Bring your event together with a fresh tea, matcha and coffee menu shaped
                        around your guests, theme and budget.
                    </p>
                    <a className={button} href="#contact">
                        Tell us about your event
                    </a>
                </div>
                <div
                    className="relative min-h-96 sm:min-h-112 md:min-h-120 lg:min-h-112"
                    aria-hidden="true"
                >
                    <Image
                        className="absolute top-0 left-1/2 z-2 h-auto w-[60%] max-w-sm -translate-x-1/2 rounded-full border-4 border-sky-600 sm:max-w-sm lg:left-[30%] lg:w-3/4 lg:translate-x-0"
                        src="/images/hero-drinks.png"
                        alt=""
                        width={480}
                        height={480}
                        priority
                        sizes="(max-width: 1024px) 72vw"
                    />
                    <Image
                        className="absolute top-[35%] left-1/2 h-auto w-full max-w-xl -translate-x-1/2 sm:top-[40%] lg:left-0 lg:w-[112%] lg:max-w-none lg:translate-x-0"
                        src="/images/textures/hero-loop.png"
                        alt=""
                        width={740}
                        height={517}
                        loading="eager"
                        sizes="(max-width: 1024px) 100vw"
                    />
                </div>
            </div>
        </AnimatedSection>
    );
}
