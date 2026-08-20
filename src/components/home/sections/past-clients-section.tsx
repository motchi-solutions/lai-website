import Image from "next/image";

import { AnimatedSection } from "../shared/animated-section";
import { sectionInner } from "../shared/section-styles";

const partners = [
    { src: "/images/partners/jayu.webp", alt: "JAYU", width: 1500, height: 982 },
    {
        src: "/images/partners/university-of-toronto.svg",
        alt: "University of Toronto",
        width: 429,
        height: 159,
    },
    { src: "/images/partners/wework.svg", alt: "WeWork", width: 804, height: 161 },
];

export function PastClientsSection() {
    return (
        <AnimatedSection
            className="overflow-hidden px-5 pt-2 pb-16 text-center sm:px-8 sm:pt-4 sm:pb-20 lg:px-12 lg:pb-24"
            aria-labelledby="partners-title"
        >
            <div className={sectionInner}>
                <h2
                    className="mb-8 text-3xl font-bold text-lai-blue lg:text-4xl"
                    id="partners-title"
                >
                    Our past clients
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-10 lg:gap-20">
                    {partners.map((partner) => (
                        <Image
                            key={partner.alt}
                            src={partner.src}
                            alt={partner.alt}
                            width={partner.width}
                            height={partner.height}
                            style={{ width: "auto", height: "auto" }}
                            className="h-auto max-h-16 w-auto max-w-40 object-contain transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:transform-none sm:max-w-52"
                        />
                    ))}
                </div>
            </div>
        </AnimatedSection>
    );
}
