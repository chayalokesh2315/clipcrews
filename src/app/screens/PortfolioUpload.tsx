import { ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { toast } from "sonner";
import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Image,
  Video,
  ArrowLeft,
  Plus,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "../components/ui/card";

import { Button } from "../components/ui/button";

import { Input } from "../components/ui/input";


// 🔥 FIREBASE
import {
  auth,
  db,
} from "../../firebase";

import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";


export default function PortfolioUpload() {

  const navigate =
    useNavigate();

  const [creator,
    setCreator] =
    useState<any>(null);

  const [loading,
    setLoading] =
    useState(false);


  // 🔥 URL STATES
  const [imageUrl,
    setImageUrl] =
    useState("");

  const [videoUrl,
    setVideoUrl] =
    useState("");


  // 🔥 EXISTING PORTFOLIO
  const [images,
    setImages] =
    useState<string[]>([]);

  const [videos,
    setVideos] =
    useState<string[]>([]);


  // 🔥 LOAD CREATOR
  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          if (!user) {

            navigate("/login");

            return;
          }

          try {

            const creatorDoc =
              await getDoc(
                doc(
                  db,
                  "creators",
                  user.uid
                )
              );

            if (
              creatorDoc.exists()
            ) {

              const data =
                creatorDoc.data();

              setCreator(data);

              setImages(
                data.portfolioImages || []
              );

              setVideos(
                data.portfolioVideos || []
              );
            }

          } catch (error) {

            console.log(error);

          }
        }
      );

    return () =>
      unsubscribe();

  }, [navigate]);


  // 🔥 ADD IMAGE

  const uploadFile = async (file: File) => {
    const user = auth.currentUser;
    if (!user) return toast("Please log in first");
    if (file.size > 25 * 1024 * 1024) return toast("File is too large. Max 25 MB.");
    const isVideo = file.type.startsWith("video/");
    try {
      setLoading(true);
      const r = sRef(storage, `portfolio/${user.uid}/${Date.now()}-${file.name}`);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      await updateDoc(doc(db, "creators", user.uid), isVideo ? { portfolioVideos: arrayUnion(url) } : { portfolioImages: arrayUnion(url) });
      toast(isVideo ? "Video uploaded" : "Image uploaded");
    } catch {
      toast("Upload failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };
  const addImage =
    async () => {

      if (!imageUrl)
        return;

      setLoading(true);

      try {

        const user =
          auth.currentUser;

        if (!user)
          return;

        await updateDoc(
          doc(
            db,
            "creators",
            user.uid
          ),
          {
            portfolioImages:
              arrayUnion(
                imageUrl
              ),
          }
        );

        setImages(
          (prev) => [
            ...prev,
            imageUrl,
          ]
        );

        setImageUrl("");

        toast(
          "Image added!"
        );

      } catch (error) {

        console.log(error);

      }

      setLoading(false);
    };


  // 🔥 ADD VIDEO
  const addVideo =
    async () => {

      if (!videoUrl)
        return;

      setLoading(true);

      try {

        const user =
          auth.currentUser;

        if (!user)
          return;

        await updateDoc(
          doc(
            db,
            "creators",
            user.uid
          ),
          {
            portfolioVideos:
              arrayUnion(
                videoUrl
              ),
          }
        );

        setVideos(
          (prev) => [
            ...prev,
            videoUrl,
          ]
        );

        setVideoUrl("");

        toast(
          "Video added!"
        );

      } catch (error) {

        console.log(error);

      }

      setLoading(false);
    };


  return (
  <div className="min-h-screen bg-gradient-to-br  via-white ">

    {/* HEADER */}
    <div className="bg-primary text-primary-foreground text-white p-6 shadow-lg">

      <button
        onClick={() => navigate(-1)}
        className="p-2 hover:bg-card/20 rounded-full transition mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <h1 className="text-3xl font-bold">
        Portfolio Upload
      </h1>

      <p className="text-white/80">
        Add your work links
      </p>

    </div>

    {/* CONTENT */}
    <div className="p-6 space-y-6">

        {/* IMAGE URL */}
<Card className="
bg-card/80
backdrop-blur-sm
rounded-3xl
shadow-lg
border-white/50
">
          <CardContent className="p-6 space-y-4">

            <div className="flex items-center gap-2">

<Image className="w-5 h-5 text-primary" />
              <h2 className="text-lg">

                Add Image URL

              </h2>

            </div>


            <label className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed p-8 cursor-pointer hover:bg-secondary transition-colors">
              <span className="font-semibold">Upload photos or videos</span>
              <span className="text-sm text-muted-foreground">JPG, PNG or MP4, up to 25 MB</span>
              <input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={async (e) => { for (const f of Array.from(e.target.files ?? []) as File[]) await uploadFile(f); e.target.value = ""; }} />
            </label>
            <Input
              placeholder="Or paste an image URL"
              value={imageUrl}
              onChange={(e) =>
                setImageUrl(
                  e.target.value
                )
              }
            />


            <Button
              onClick={addImage}
              disabled={loading}
              className="
  w-full
  rounded-full
  bg-primary text-primary-foreground
  hover:
  hover:
  hover:
  text-white"
            >

              <Plus className="w-4 h-4 mr-2" />

              Add Image

            </Button>

          </CardContent>

        </Card>


        {/* VIDEO URL */}
        <Card className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-lg border-white/50">

          <CardContent className="p-6 space-y-4">

            <div className="flex items-center gap-2">

              <Video className="w-5 h-5 text-primary" />

              <h2 className="text-lg">

                Add Video URL

              </h2>

            </div>


            <Input
              placeholder="Paste YouTube/video URL"
              value={videoUrl}
              onChange={(e) =>
                setVideoUrl(
                  e.target.value
                )
              }
            />


            <Button
              onClick={addVideo}
              disabled={loading}
              className="
  w-full
  rounded-full
  bg-primary text-primary-foreground
  hover:
  hover:
  hover:
  text-white"
            >

              <Plus className="w-4 h-4 mr-2" />

              Add Video

            </Button>

          </CardContent>

        </Card>


        {/* IMAGES */}
        <div>

          <h2 className="text-xl mb-4">

            Uploaded Images

          </h2>

          <div className="grid grid-cols-2 gap-4">

            {images.map(
              (
                image,
                index
              ) => (

                <img
                  key={index}
                  src={image}
                  alt=""
                  className="w-full h-40 object-cover rounded-lg border"
                />

              )
            )}

          </div>

        </div>


        {/* VIDEOS */}
        <div>

          <h2 className="text-xl mb-4">

            Uploaded Videos

          </h2>

          <div className="space-y-4">

            {videos.map(
              (
                video,
                index
              ) => (

                <a
                  key={index}
                  href={video}
                  target="_blank"
                  className="block p-4 border rounded-lg hover:bg-muted"
                >

                  {video}

                </a>

              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
