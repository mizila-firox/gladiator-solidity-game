import "./globals.css";

export const metadata = {
  title: "Gladiator Arena",
  description: "Fight monsters and players in the ultimate gladiator arena",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
