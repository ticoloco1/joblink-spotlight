'use client';

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <>
      <Helmet>
        <title>Page Not Found | JobinLink</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to JobinLink to find professionals and opportunities." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
          <p className="mb-2 text-2xl font-semibold">Page Not Found</p>
          <p className="mb-8 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:bg-primary/90">
            Return to Home
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
