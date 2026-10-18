import { toast } from "sonner";
import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Camera,
  Mail,
  Lock,
  User,
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

import {
  RadioGroup,
  RadioGroupItem,
} from "../components/ui/radio-group";


// 🔥 FIREBASE
import {
  auth,
  db,
  googleProvider,
} from "../../firebase";

import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import {
  doc,
  setDoc,
} from "firebase/firestore";


export default function Register() {

  const navigate =
    useNavigate();

  const [name,
    setName] =
    useState("");

  const [email,
    setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [role,
    setRole] =
    useState("customer");

  const [profileImage,
    setProfileImage] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);


  // 🔥 REGISTER
  const handleRegister =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault();

      setLoading(true);

      try {

        // 🔥 CREATE USER
        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        const user =
          userCredential.user;


        // 🔥 SAVE USER DATA
        await setDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {
            uid:
              user.uid,

            name,

            email,

            role,

            profileImage,

            createdAt:
              new Date(),
          }
        );


        // 🔥 NAVIGATION
        if (
          role ===
          "creator"
        ) {

          navigate(
            "/creator-setup"
          );

        } else {

          navigate(
            "/categories"
          );

        }

      } catch (
        error: any
      ) {

        toast(
          error.message
        );

      }

      setLoading(false);
    };
    const handleGoogleRegister =
  async () => {

    try {

      const result =
        await signInWithPopup(
          auth,
          googleProvider
        );

      const user =
        result.user;

      await setDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {
          uid: user.uid,

          name:
            user.displayName || "",

          email:
            user.email || "",

          role,

          profileImage:
            user.photoURL || "",

          createdAt:
            new Date(),
        },
        { merge: true }
      );

      if (role === "creator") {

        navigate(
          "/creator-setup"
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
    <div className="min-h-screen bg-gradient-to-br  via-white  p-6">
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

    <div className="flex items-center gap-6">
      <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-primary">
        Home
      </button>

      <button onClick={() => navigate("/about")} className="text-muted-foreground hover:text-primary">
        About
      </button>

      <button onClick={() => navigate("/contact")} className="text-muted-foreground hover:text-primary">
        Contact
      </button>
    </div>

  </div>
</div>


      {/* CARD */}
      <div className="flex-1 flex items-center justify-center pb-8">
        <Card className="w-full max-w-lg bg-card/80 backdrop-blur-md border border-white/50 rounded-[32px] shadow-xl">
          <CardHeader>
            <CardTitle className="fancy-heading text-4xl text-center">
  Create{" "}
  <span className="bg-primary text-primary-foreground bg-clip-text text-transparent">
    Account
  </span>
</CardTitle>

            <CardDescription className="text-center text-muted-foreground">
  Join the Clip Crew community
</CardDescription>
          </CardHeader>


          <CardContent>

            <form
              onSubmit={
                handleRegister
              }
              className="space-y-4"
            >

              {/* NAME */}
              <div className="space-y-2">

                <Label htmlFor="name">

                  Full Name

                </Label>

                <div className="relative">

                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    className="pl-10 rounded-2xl border border-border bg-card/80 h-12 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />

                </div>

              </div>


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
                    placeholder="Create a password"
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


              {/* PROFILE IMAGE */}
              <div className="space-y-2">

                <Label htmlFor="profileImage">

                  Profile Image URL

                </Label>

                <Input
                  id="profileImage"
                  type="text"
                  placeholder="Paste profile image URL"
                  value={profileImage}
                  onChange={(e) =>
                    setProfileImage(
                      e.target.value
                    )
                  }
                />

              </div>


              {/* ROLE */}
              <div className="mt-2">

                <Label>

                  I am a

                </Label>

                <div className="grid grid-cols-2 gap-4">
  <button
    type="button"
    onClick={() => setRole("customer")}
    className={`p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
      role === "customer"
        ? "bg-primary text-primary-foreground text-white shadow-lg"
        : "bg-card border-border"
    }`}
  >
    <h3 className="font-semibold">Customer</h3>
    <p className="text-sm">Looking to hire</p>
  </button>

  <button
    type="button"
    onClick={() => setRole("creator")}
    className={`p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
      role === "creator"
        ? "bg-primary text-primary-foreground text-white shadow-lg"
        : "bg-card border-border"
    }`}
  >
    <h3 className="font-semibold">Creator</h3>
    <p className="text-sm">Offering services</p>
  </button>
</div>
              </div>
              


              {/* BUTTON */}
              {/* REGISTER */}
<Button
  type="submit"
  disabled={loading}
  className="w-full h-12 bg-primary text-primary-foreground text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
>

  {loading
    ? "Creating Account..."
    : "Register"}

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

          {/* GOOGLE REGISTER */}
<Button
  type="button"
  onClick={handleGoogleRegister}
className="w-full h-12 bg-primary text-primary-foreground text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3">

  <div className="bg-card rounded-full p-1 flex items-center justify-center">
  <img
    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
    alt="Google"
    className="w-4 h-4 object-contain"
  />
</div>

  <span className="font-medium">
    Continue with Google
  </span>

</Button>



              {/* LOGIN */}
              <div className="text-center text-sm text-muted-foreground">

                Already have an account?{" "}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/login"
                    )
                  }
                  className="bg-primary text-primary-foreground bg-clip-text text-transparent font-semibold hover:opacity-80"
                >

                  Login

                </button>

              </div>

            </form>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}