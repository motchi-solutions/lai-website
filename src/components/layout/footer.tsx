export function Footer() {
    return (
        <footer className="bg-ink p-8 text-center text-white">
            <p className="m-0">
                © {new Date().getFullYear()} Lai Catering. Serving the Greater Toronto Area.
            </p>
            <p className="mt-2 text-sm text-white/75">
                Website by{" "}
                <a
                    className="underline decoration-white/50 underline-offset-4 transition hover:text-white"
                    href="https://motchi.ca"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Motchi Websites
                </a>
            </p>
        </footer>
    );
}
