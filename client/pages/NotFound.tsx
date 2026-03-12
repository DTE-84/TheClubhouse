import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import HomeLayout from "@/components/HomeLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <HomeLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 pt-20">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">⛳</div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">404</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Oops! This page is not yet available at TheClubHouse.
          </p>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            It looks like you've wandered off the fairway. Let's get you back on course!
          </p>
          <Link
            to="/"
            className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </HomeLayout>
  );
};

export default NotFound;
