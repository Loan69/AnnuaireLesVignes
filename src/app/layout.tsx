import './globals.css'
import { Providers } from './providers'
import { Montserrat } from "next/font/google"
import localFont from "next/font/local"

// Import Montserrat (corps de texte)
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

// Import Bauer Bodoni (titres)
const bauerBodoni = localFont({
  src: "../../public/fonts/BauerBodoni.ttf",
  variable: "--font-bauer-bodoni",
})

export const metadata = {
  title: 'Collège Les Vignes',
  description: 'Annuaire du Collège Les Vignes',
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV

  return (
    <html 
      lang="fr"
      className={`${montserrat.variable} ${bauerBodoni.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      </head>
      <body>
        {appEnv === 'preprod' && (
          <div className="w-full bg-yellow-300 text-black text-center p-2 text-sm font-semibold animate-pulse">
            Environnement de PRÉPRODUCTION
          </div>
        )}
        {appEnv === 'development' && (
          <div className="w-full bg-green-600 text-black text-center p-2 text-sm font-semibold animate-pulse">
            Environnement de DÉVELOPPEMENT
          </div>
        )}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
