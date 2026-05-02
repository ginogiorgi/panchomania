import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import Footer from "@/components/Footer"

export const metadata: Metadata = {
  title: "Panchomania",
  description: "El concurso de panchos más épico de internet",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col">
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  )
}
