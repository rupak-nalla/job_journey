import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import AuthProviderWrapper from "@/components/AuthProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Job Application Tracker | Manage Your Job Search",
  description: "Track and manage your job applications with ease. Keep track of application status, interviews, and resumes all in one place.",
  keywords: ["job journey", "job application", "career", "job search", "application management"],
  authors: [{ name: "JobJourney" }],
  openGraph: {
    title: "Job Application Tracker",
    description: "Track and manage your job applications with ease",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0077b6",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="robots" content="index, follow" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProviderWrapper>
            {children}
          </AuthProviderWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
