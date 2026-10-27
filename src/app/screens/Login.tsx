import { toast } from "sonner";
import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Camera,
  Mail,
  Lock,
} from "lucide-react";

import { Button } from "../components/ui/button";

import { Input } from "../components/ui/input";

import { Label } from "../components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";


// 🔥 FIREBASE
import {
  auth,
  db,
  googleProvider,
} from "../../firebase";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";


export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // 🔥 ROLE
  const [role, setRole] =
    useState<
      "customer" | "creator"
    >("customer");


  // 🔥 LOGIN
  const handleLogin = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setLoading(true);

    try {

      // 🔥 FIREBASE LOGIN
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user =
        userCredential.user;


      // 🔥 GET USER DATA
      const userDoc =
        await getDoc(
          doc(
            db,
            "users",
            user.uid
          )
        );

      const userData =
        userDoc.data();


      // 🚫 WRONG ROLE LOGIN
      if (
        userData?.role !== role
      ) {

        toast(
          `This account is registered as ${userData?.role}`
        );

        return;
      }


      // 🔥 NAVIGATION
      if (role === "creator") {

        navigate("/dashboard");

      } else {

        navigate("/categories");

      }

    } catch (error: any) {

      console.log(error);

      toast(error.message);

    }

    setLoading(false);
  };
// 🔥 GOOGLE LOGIN
const handleGoogleLogin =
  async () => {

    try {

      const result =
        await signInWithPopup(
          auth,
          googleProvider
        );

      const user =
        result.user;

      const userDoc =
        await getDoc(
          doc(
            db,
            "users",
            user.uid
          )
        );

      const userData =
        userDoc.data();

      if (
        userData?.role ===
        "creator"
      ) {

        navigate(
          "/dashboard"
        );

      } else {

        navigate(
          "/categories"
        );

      }

    } catch (error: any) {

      toast(error.message);

    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  via-white  flex flex-col p-6">

      {/* HEADER */}
     <div className="max-w-6xl mx-auto w-full mb-10">
  <div className="bg-card/80 backdrop-blur-md rounded-full px-8 py-4 shadow-lg flex items-center justify-between">

    <div
      onClick={() => navigate("/")}
      className="flex items-center gap-3 cursor-pointer"
    >
      <div className="bg-primary text-primary-foreground p-2 rounded-xl">
        <Camera className="w-6 h-6 text-white" />
      </div>

      <h1 className="fancy-heading text-3xl text-foreground">
        Clip Crew
      </h1>
    </div>

    <button
      onClick={() => navigate("/")}
      className="text-muted-foreground hover:text-primary font-medium transition"
    >
      Home
    </button>
    <button
    onClick={() => navigate("/about")}
    className="text-muted-foreground hover:text-primary transition"
  >
    About
  </button>

  <button
    onClick={() => navigate("/contact")}
    className="text-muted-foreground hover:text-primary transition"
  >
    Contact
  </button>

  </div>
</div>


      {/* LOGIN CARD */}
       <div className="flex-1 flex items-center justify-center">

        <Card className="w-full max-w-lg bg-card/80 backdrop-blur-md border border-white/50 rounded-[32px] shadow-xl">

          <CardHeader>

            <CardTitle className="fancy-heading text-4xl text-center">
  Welcome{" "}
  <span className="bg-primary text-primary-foreground bg-clip-text text-transparent">
    Back
  </span>
</CardTitle>

            <CardDescription className="text-center text-muted-foreground text-base">
  Login to continue your creative journey
</CardDescription>

          </CardHeader>

          <CardContent>

            {/* ROLE SELECTOR */}
            <div className="grid grid-cols-2 gap-2 mb-6">

              <button
                type="button"
                onClick={() =>
                  setRole(
                    "customer"
                  )
                }
                className={`p-3 rounded-lg border transition-colors ${
                  role ===
                  "customer"
                    ? "bg-primary text-primary-foreground text-white shadow-md"
                    : "bg-card text-foreground border-border"
                }`}
              >

                Customer

              </button>


              <button
                type="button"
                onClick={() =>
                  setRole(
                    "creator"
                  )
                }
                className={`p-3 rounded-lg border transition-colors ${
                  role ===
                  "creator"
                    ? "bg-primary text-primary-foreground text-white shadow-md"
                    : "bg-card text-foreground border-border"
                }`}
              >

                Creator

              </button>

            </div>


            <form
              onSubmit={handleLogin}
              className="space-y-4"
            >

              {/* EMAIL */}
              <div className="space-y-2">

                <Label htmlFor="email">
                  Email
                </Label>

                <div className="relative">

                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    className="pl-10 rounded-2xl border border-border bg-card/80 h-12 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />

                </div>

              </div>


              {/* PASSWORD */}
              <div className="space-y-2">

                <Label htmlFor="password">
                  Password
                </Label>

                <div className="relative">

                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    className="pl-10 rounded-2xl border border-border bg-card/80 h-12 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />

                </div>

              </div>



              {/*google button*/}
              <Button
  type="button"
  onClick={handleGoogleLogin}
  className="w-full h-12 bg-primary text-primary-foreground text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
>

  <img
    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
    alt="Google"
    className="w-5 h-5 bg-card rounded-full p-0.5"
  />

  <span className="font-medium">
    Continue with Google
  </span>

</Button>

<div className="relative my-4">

  <div className="absolute inset-0 flex items-center">

    <div className="w-full border-t border-border" />

  </div>

  <div className="relative flex justify-center text-sm">

    <span className="bg-card px-4 text-muted-foreground">
      OR
    </span>

  </div>

</div>


              {/* BUTTON */}
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover: hover: hover: text-white shadow-md"
                disabled={loading}
              >

                {loading
                  ? "Logging in..."
                  : `Login as ${
                      role ===
                      "creator"
                        ? "Creator"
                        : "Customer"
                    }`}

              </Button>


              {/* REGISTER */}
              <div className="text-center text-sm text-muted-foreground pt-2">
  New to Clip Crew?

  <button
    type="button"
    onClick={() => navigate("/register")}
    className="ml-2 bg-primary text-primary-foreground bg-clip-text text-transparent font-semibold"
  >
    Create Account
  </button>
</div>

            </form>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}