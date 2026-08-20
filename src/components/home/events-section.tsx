import Image from "next/image";

import { AnimatedSection } from "./animated-section";
import { displayTitle, lede, section, sectionInner } from "./section-styles";

const eventImages = [
    {
        src: "/images/showcase/event-feature.jpg",
        alt: "Matcha and fruit tea served beside flowers at an event",
        featured: true,
    },
    {
        src: "/images/showcase/event-coffee.jpg",
        alt: "Freshly brewed iced coffee at a catered event",
    },
    { src: "/images/showcase/event-barista.jpg", alt: "A barista preparing drinks at an event" },
    {
        src: "/images/showcase/event-barista.jpg",
        alt: "A close view of barista service at a catered event",
    },
    { src: "/images/showcase/event-menu.jpg", alt: "A custom drink menu displayed at an event" },
];

export function EventsSection() {
    return (
        <AnimatedSection
            className={`${section} block !pb-4 pt-16 sm:!pb-6 sm:pt-18 lg:!pb-8 lg:pt-24`}
            id="events"
            aria-labelledby="events-title"
        >
            <div
                className={`${sectionInner} grid items-center gap-2 sm:gap-4 lg:grid-cols-5 lg:gap-14`}
            >
                <div className="min-w-0 lg:col-span-2">
                    <h2 className={displayTitle} id="events-title">
                        Take drink <br className="hidden lg:block" />
                        planning off <br className="hidden lg:block" />
                        your plate.
                    </h2>
                    <p className={lede}>
                        From corporate to community events, our custom menus make refreshment simple
                        and delicious.
                    </p>
                </div>
                <div
                    className="-mx-5 grid grid-cols-2 grid-rows-[15rem_9rem_9rem] gap-3 bg-mist p-3 sm:mx-0 sm:grid-rows-[18rem_10rem_10rem] md:grid-rows-[20rem_11rem_11rem] lg:col-span-3 lg:h-144 lg:grid-rows-3 lg:gap-4 lg:p-4"
                    aria-label="A selection of Lai catered events"
                >
                    {eventImages.map((image, index) => (
                        <figure
                            className={`relative m-0 min-h-0 overflow-hidden ${image.featured ? "col-span-2 lg:col-span-1 lg:row-span-2" : ""}`}
                            key={`${image.src}-${index}`}
                        >
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                loading={image.featured ? "eager" : undefined}
                                sizes={
                                    image.featured
                                        ? "(max-width: 900px) 100vw, (max-width: 1180px) 45vw, 30vw"
                                        : "(max-width: 900px) 50vw, (max-width: 1180px) 45vw, 22vw"
                                }
                                className="object-cover"
                            />
                        </figure>
                    ))}
                </div>
            </div>
        </AnimatedSection>
    );
}
