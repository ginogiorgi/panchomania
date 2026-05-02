export default function Footer() {
  return (
    <footer className="py-4 text-center text-sm" style={{ color: "var(--foreground-muted)" }}>
      Hecho por{" "}
      <a
        href="https://www.pyrux.com.ar"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold transition-colors hover:text-[var(--coral)]"
        style={{ color: "var(--coral-mid)" }}
      >
        Pyrux
      </a>
    </footer>
  )
}
