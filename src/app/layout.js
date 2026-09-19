import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata = {
  title: "🕊️ Kabootar",
  description: "Fast, private messaging for everyone.",
  manifest: "/manifest.json",
  themeColor: "#C85A32"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
