import { Inter } from "next/font/google";
import "./bento.css"; // Import the bento CSS for the projects page
import Script from "next/script";

const inter = Inter({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`projects-layout ${inter.variable}`}>
      {/* Add analytics or custom scripts if needed */}
      
      <div className="projects-layout-container">
        {children}
      </div>
    </div>
  );
}

export const metadata = {
  title: "My Projects | Aditya Nalawade",
  description: "A collection of projects showcasing my skills in Python and Web Development - presented in a modern bento grid layout.",
};