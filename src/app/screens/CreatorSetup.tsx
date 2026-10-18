import { toast } from "sonner";
import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import {
  Camera,
  Briefcase,
  IndianRupee,
  FileText,
  User,
  MapPin,
  Image,
} from "lucide-react";

import { auth, db } from "../../firebase";

import {
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Input } from "../components/ui/input";

import { Button } from "../components/ui/button";

import { Label } from "../components/ui/label";


export default function CreatorSetup() {

  const navigate = useNavigate();

  const [name, setName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [subCategory, setSubCategory] =
    useState("");

  const [experience, setExperience] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [about, setAbout] =
    useState("");

  const [profileImage,
    setProfileImage] =
    useState("");

  const [loading, setLoading] =
    useState(false);
  const [isEditMode, setIsEditMode] =
  useState(false);


  useEffect(() => {

  const loadProfile = async () => {

    const user = auth.currentUser;

    if (!user) return;

    const docRef =
      doc(db, "creators", user.uid);

    const docSnap =
      await getDoc(docRef);

    if (docSnap.exists()) {

      const data = docSnap.data();

      setName(data.name || "");
      setCategory(data.category || "");
      setSubCategory(
        data.subCategory || ""
      );
      setExperience(
        String(
          data.experience || ""
        )
      );
      setPrice(
        String(
          data.price || ""
        )
      );
      setLocation(
        data.location || ""
      );
      setAbout(
        data.about || ""
      );
      setProfileImage(
        data.profileImage || ""
      );

      setIsEditMode(true);
    }
  };

  loadProfile();

}, []);

  // 🔥 SUBMIT
  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setLoading(true);

    try {

      const user = auth.currentUser;

      if (!user) {

        toast("User not found");

        return;
      }

      // 🔥 SAVE CREATOR PROFILE
      await setDoc(
        doc(db, "creators", user.uid),
        {
          uid: user.uid,

          name,

          email: user.email,

          category,

          subCategory,

          experience:
            Number(experience),

          price:
            Number(price),

          location,

          about,

          profileImage,

          

          

          ...(isEditMode ? {} : { createdAt: new Date(), rating: 0, totalReviews: 0, portfolioImages: [], portfolioVideos: [] }),
        },
        { merge: true }
      );

     toast(
  isEditMode
    ? "Profile Updated!"
    : "Creator Profile Created!"
);

      navigate("/dashboard");

    } catch (error: any) {

      console.log(error);

      toast(error.message);

    }

    setLoading(false);
  };


  return (
<div className="min-h-screen bg-gradient-to-br  via-white  p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8 pt-4">

<div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-md">
          <Camera className="w-6 h-6 text-white" />

        </div>

<h1 className="text-4xl font-bold text-foreground">
          Creator Setup

        </h1>

      </div>


      {/* CARD */}
<Card className="
max-w-xl
mx-auto
bg-card/80
backdrop-blur-sm
rounded-3xl
shadow-xl
border-white/50
">
        <CardHeader>

          <CardTitle>

            Complete Your Profile

          </CardTitle>

        </CardHeader>

        <CardContent>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* NAME */}
            <div className="space-y-2">

              <Label>
                Full Name
              </Label>

              <div className="relative">

                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

                <Input
                  placeholder="Rahul Photography"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="
pl-10
rounded-2xl
h-12
border-border
focus:border-primary
"required
                />

              </div>

            </div>


            {/* CATEGORY */}
            <div className="space-y-2">

              <Label>
                Category
              </Label>

              <div className="relative">

                <Briefcase className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

                <Input
                  placeholder="Media"
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                  className="
pl-10
rounded-2xl
h-12
border-border
focus:border-primary
"required
                />

              </div>

            </div>


            {/* SUBCATEGORY */}
            <div className="space-y-2">

              <Label>
                Sub Category
              </Label>

              <Input
                placeholder="Photographer"
                value={subCategory}
                onChange={(e) =>
                  setSubCategory(
                    e.target.value
                  )
                }
                className="
pl-10
rounded-2xl
h-12
border-border
focus:border-primary
"required
              />

            </div>


            {/* EXPERIENCE */}
            <div className="space-y-2">

              <Label>
                Experience
              </Label>

              <Input
                type="number"
                placeholder="5"
                value={experience}
                onChange={(e) =>
                  setExperience(
                    e.target.value
                  )
                }
                className="
pl-10
rounded-2xl
h-12
border-border
focus:border-primary
"
 required
              />
 
            </div>


            {/* PRICE */}
            <div className="space-y-2">

             <Label className="text-foreground font-medium">
  Price (Per 4 Hours)
</Label>

              <div className="relative">

                <IndianRupee className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

                <Input
                  type="number"
                  placeholder="5000"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value
                    )
                  }
                  className="
pl-10
rounded-2xl
h-12
border-border
focus:border-primary
"
                  required
                />
                

              </div>

            </div>


            {/* LOCATION */}
            <div className="space-y-2">

              <Label>
                Location
              </Label>

              <div className="relative">

                <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

                <Input
                  placeholder="Bangalore"
                  value={location}
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                  className="pl-10"
                  required
                />

              </div>

            </div>


            {/* PROFILE IMAGE URL */}
            <div className="space-y-2">

              <Label>
                Profile Photo URL
              </Label>
              {profileImage && (
  <div className="flex justify-center mt-4">

    <img
      src={profileImage}
      alt="Preview"
      className="
        w-24
        h-24
        rounded-full
        object-cover
        border-4
        border-white
        shadow-lg
      "
    />

  </div>
)}

              <div className="relative">

                <Image className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

                <Input
                  placeholder="https://example.com/image.jpg"
                  value={profileImage}
                  onChange={(e) =>
                    setProfileImage(
                      e.target.value
                    )
                  }
                  className="
pl-10
rounded-2xl
h-12
border-border
focus:border-primary
"
                  required
                />

              </div>

            </div>


            {/* ABOUT */}
            <div className="space-y-2">

              <Label>
                About
              </Label>

              <div className="relative">

                <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

                <textarea
                  placeholder="Tell about yourself..."
                  value={about}
                  onChange={(e) =>
                    setAbout(
                      e.target.value
                    )
                  }
className="
w-full
rounded-2xl
border
border-border
p-4
pl-10
focus:border-primary
outline-none
"                  rows={4}
                  required
                />

              </div>

            </div>


            {/* BUTTON */}
            <Button
              type="submit"
className="
w-full
h-14
rounded-full
bg-primary text-primary-foreground
hover:
hover:
hover:
text-white
shadow-lg
"              disabled={loading}
            >

              {loading
  ? "Saving..."
  : isEditMode
  ? "Update Profile"
  : "Create Profile"}

            </Button>

          </form>

        </CardContent>

      </Card>

    </div>
  );
}