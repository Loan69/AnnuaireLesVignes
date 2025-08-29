import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Collège Les Vignes',
  description: 'Logiciel de gestion et d&apos;édition de facture pour entrepreneurs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV

  return (
    <html lang="fr">
      <head />
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
