import { IBM_Plex_Sans_Thai_Looped } from "next/font/google"
import "./globals.css"
import { RegisterProvider } from "@/src/context/RegisterContext"

const ibmPlex = IBM_Plex_Sans_Thai_Looped({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500'],
  variable: '--font-ibm'
})

export const metadata = {
  title: "Menut — Meet-up Possible",
  description: "Web application สำหรับคน มีนัด",
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={`${ibmPlex.variable} font-(--font-ibm) antialiased`}>
        <RegisterProvider>
          {children}
        </RegisterProvider>
      </body>
    </html>
  )
}