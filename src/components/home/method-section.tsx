import Image from "next/image";

import { AnimatedSection } from "./animated-section";
import { displayTitle, lede, section, sectionInner } from "./section-styles";

export function MethodSection() {
    return (
        <AnimatedSection className={section} id="method" aria-labelledby="method-title">
            <div
                className={`${sectionInner} grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16`}
            >
                <Image
                    className="order-2 h-auto w-full max-w-sm justify-self-center md:max-w-md lg:order-1 lg:max-w-lg"
                    src="/images/method-drinks.png"
                    alt="Three original Lai drinks: matcha, a fruit refresher, and coffee"
                    width={600}
                    height={776}
                    loading="eager"
                    sizes="(max-width: 900px) 90vw, 44vw"
                />
                <div className="min-w-0 lg:order-2">
                    <h2 className={`${displayTitle} max-w-4xl`} id="method-title">
                        Original flavours your guests will notice.
                    </h2>
                    <p className={lede}>
                        Every drink on your menu is handcrafted with carefully chosen ingredients.
                        It&apos;s all made fresh for your guests to enjoy.
                    </p>
                </div>
            </div>
        </AnimatedSection>
    );
}
