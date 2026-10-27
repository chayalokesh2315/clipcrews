import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { Camera } from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {

    const timer = setTimeout(() => {

      // KEEP SAME NAVIGATION
      navigate("/login");

    }, 2500);

    return () => clearTimeout(timer);

  }, [navigate]);

  return (
    <div className="min-h-screen bg-card flex flex-col items-center justify-center p-6">

      <div className="flex flex-col items-center gap-6 animate-fade-in">

        <div className="bg-blue-600 p-8 rounded-full">

          <Camera className="w-16 h-16 text-white" />

        </div>

        <div className="text-center">

          <h1 className="text-4xl mb-2 text-foreground">
            Clip Crew
          </h1>

          <p className="text-muted-foreground">
            Find Creative Professionals
          </p>

        </div>

      </div>

    </div>
  );
}