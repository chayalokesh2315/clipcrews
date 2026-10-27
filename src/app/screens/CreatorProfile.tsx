import HeartButton from "../components/HeartButton";
import VerifiedBadge from "../components/VerifiedBadge";
import PackagesList from "../components/PackagesList";
import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Star,
  MapPin,
  Briefcase,
  MessageCircle,
} from "lucide-react";

import { Button } from "../components/ui/button";

import {
  Card,
  CardContent,
} from "../components/ui/card";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";


// 🔥 FIREBASE
import { auth, db } from "../../firebase";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";


export default function CreatorProfile() {

  const navigate = useNavigate();

  const { id } = useParams();

 const [creator, setCreator] =
  useState<any>(null);

const [reviews, setReviews] =
  useState<any[]>([]);

const [loading, setLoading] =
  useState(true);
  const isOwner =
    auth.currentUser?.uid === id;
  // 🔥 FETCH CREATOR
  useEffect(() => {

    const fetchCreator =
      async () => {

        try {

          const creatorRef =
            doc(
              db,
              "creators",
              id as string
            );

          const creatorSnap =
            await getDoc(
              creatorRef
            );

          if (
            creatorSnap.exists()
          ) {

            setCreator({
              id:
                creatorSnap.id,
              ...creatorSnap.data(),
            });
            const reviewsQuery =
  query(
    collection(db, "reviews"),
    where("creatorId", "==", id)
  );

const reviewsSnapshot =
  await getDocs(reviewsQuery);

const reviewsData =
  reviewsSnapshot.docs.map(
    (doc) => ({
      id: doc.id,
      ...doc.data(),
    })
  );

setReviews(reviewsData);

          } else {

            setCreator(null);

          }

        } catch (error) {

          console.log(error);

        }

        setLoading(false);
      };

    fetchCreator();

  }, [id]);


  // 🔥 LOADING
  if (loading) {

    return (
      <div className="min-h-screen bg-card flex items-center justify-center">

        <p className="text-muted-foreground">

          Loading creator...

        </p>

      </div>
    );
  }


  // 🔥 NOT FOUND
  if (!creator) {

    return (
      <div className="min-h-screen bg-card flex items-center justify-center">

        <p className="text-muted-foreground">

          Creator not found

        </p>

      </div>
    );
  }


  // 🔥 MERGE MEDIA
  const allMedia = [
    ...(creator.portfolioImages || []),
    ...(creator.portfolioVideos || []),
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br  via-white  pb-24">

      {/* HEADER */}
      <div className="bg-primary text-primary-foreground text-white p-8 rounded-b-3xl shadow-lg">

        <button
          onClick={() =>
            navigate(-1)
          }
          className="p-2 hover:bg-blue-500 rounded-full transition-colors mb-4"
        >

          <ArrowLeft className="w-5 h-5" />

        </button>


        <div className="flex items-start gap-4">

      {/* PROFILE IMAGE */}
<div className="w-24 h-24 rounded-lg overflow-hidden bg-card/20 shrink-0">

  <img
    src={
      creator.profileImage?.trim()
        ? creator.profileImage
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
            creator.name || "Creator"
          )}&background=2563eb&color=fff&size=200`
    }
    alt={creator.name}
    className="w-full h-full object-cover"

    onError={(e) => {
      e.currentTarget.src =
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          creator.name || "Creator"
        )}&background=2563eb&color=fff&size=200`;
    }}
  />

</div>


          <div className="flex-1">

            <h1 className="text-2xl mb-2">

              {creator.name}{creator.verified && <VerifiedBadge />}<HeartButton id={creator.id} inline />

            </h1>

            <p className="text-blue-100 mb-3">

              {creator.subCategory}

            </p>


            <div className="flex items-center gap-4 text-sm">

              {/* RATING */}
              <div className="flex items-center gap-1">

                <Star className="w-4 h-4 fill-white text-white" />

                <span>
                  {creator.rating || 0}
                </span>

                <span className="text-blue-200">

                  (
                  {creator.totalReviews || 0}
                  )

                </span>

              </div>


              {/* EXPERIENCE */}
              <div className="flex items-center gap-1">

                <Briefcase className="w-4 h-4" />

                <span>

                  {creator.experience || 0}
                  {" "}
                  years

                </span>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* CONTENT */}
      <div className="p-6 space-y-6">

        {/* LOCATION & PRICE */}
        <Card className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-lg border-white/50">

          <CardContent className="p-4">

            <div className="flex items-center justify-between">

              {/* LOCATION */}
              <div className="flex items-center gap-2 text-foreground">

                <MapPin className="w-5 h-5 text-muted-foreground" />

                <span>

                  {creator.location ||
                    "Unknown"}

                </span>

              </div>


              {/* PRICE */}
              <div className="text-right">

                <div className="text-sm text-muted-foreground">

                  Starting from

                </div>

                <div className="text-2xl font-bold bg-primary text-primary-foreground bg-clip-text text-transparent">

                  ₹
                  {creator.price?.toLocaleString() || 0}

                </div>

              </div>

            </div>

          </CardContent>

        </Card>


        {/* ABOUT */}
        <div>

          <h2 className="text-lg text-foreground mb-3">

            About

          </h2>

<Card className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-lg border-white/50">
            <CardContent className="p-4">

              <p className="text-foreground leading-relaxed">

                {creator.about ||
                  "No description available"}

              </p>

            </CardContent>

          </Card>

        </div>


        <PackagesList packages={creator.packages} />
        {/* PORTFOLIO */}
        <div>

          <h2 className="text-lg text-foreground mb-3">

            Portfolio

          </h2>


          <Tabs
            defaultValue="all"
            className="w-full"
          >

            <TabsList className="w-full">

              <TabsTrigger
                value="all"
                className="flex-1"
              >

                All (
                {allMedia.length}
                )

              </TabsTrigger>


              <TabsTrigger
                value="images"
                className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]: data-[state=active]: data-[state=active]: data-[state=active]:text-white"
              >

                Images (
                {creator.portfolioImages?.length || 0}
                )

              </TabsTrigger>


              <TabsTrigger
                value="videos"
                className="flex-1"
              >

                Videos (
                {creator.portfolioVideos?.length || 0}
                )

              </TabsTrigger>

            </TabsList>


            {/* ALL */}
            <TabsContent
              value="all"
              className="mt-4"
            >

              <div className="grid grid-cols-2 gap-3">

                {allMedia.map(
                  (
                    url: string,
                    idx: number
                  ) => (

                    <div
                      key={idx}
                      className="aspect-square rounded-lg overflow-hidden bg-muted"
                    >

                      <img
                        src={url}
                        alt={`Portfolio ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                    </div>
                  )
                )}

              </div>


              {allMedia.length === 0 && (
  <Card className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-lg border-white/50">
    <CardContent className="p-10 text-center">
      <div className="text-5xl mb-4">📸</div>

      <h3 className="text-xl font-semibold text-foreground mb-2">
        Portfolio Coming Soon
      </h3>

      <p className="text-muted-foreground">
        This creator has not uploaded portfolio items yet.
      </p>
    </CardContent>
  </Card>
)}
            </TabsContent>


            {/* IMAGES */}
            <TabsContent
              value="images"
              className="mt-4"
            >

              <div className="grid grid-cols-2 gap-3">

                {(creator.portfolioImages || []).map(
                  (
                    url: string,
                    idx: number
                  ) => (

                    <div
                      key={idx}
                      className="aspect-square rounded-lg overflow-hidden bg-muted"
                    >

                      <img
                        src={url}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                    </div>
                  )
                )}

              </div>

            </TabsContent>


            {/* VIDEOS */}
            <TabsContent
              value="videos"
              className="mt-4"
            >

              <div className="space-y-3">

                {(creator.portfolioVideos || []).map(
                  (
                    url: string,
                    idx: number
                  ) => (

                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      className="block p-4 border rounded-lg hover:bg-muted"
                    >

                      {url}

                    </a>
                  )
                )}

              </div>

            </TabsContent>

          </Tabs>

        </div>

      </div>
     {/* REVIEWS */}
<div>
  <div className="flex items-center justify-between mb-4">

    <h2 className="text-2xl font-bold text-foreground">
      Reviews
    </h2>

    <div className="px-3 py-1 rounded-full bg-secondary text-primary text-sm">
      {reviews.length} Reviews
    </div>

  </div>

  <Card className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-lg border-white/50">

    <CardContent className="p-6">

      {reviews.length === 0 ? (

        <div className="text-center py-8">

          <div className="text-5xl mb-3">⭐</div>

          <p className="text-muted-foreground">
            No reviews yet. Be the first to review!
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {reviews.map((review: any) => (

            <div
              key={review.id}
              className="
                bg-card
                rounded-2xl
                shadow-sm
                border
                border-border
                p-5
                hover:shadow-md
                transition
              "
            >

              <div className="flex justify-between items-center mb-2">

                <div>
                  <h3 className="font-semibold text-foreground">
                    {review.customerName}
                  </h3>
                </div>

                <div className="flex">
                  {Array(review.rating)
                    .fill(0)
                    .map((_, index) => (
                      <span
                        key={index}
                        className="text-yellow-400 text-lg"
                      >
                        ★
                      </span>
                    ))}
                </div>

              </div>

              <p className="text-muted-foreground leading-relaxed">
                {review.comment}
              </p>

            </div>

          ))}

        </div>

      )}

    </CardContent>

  </Card>
</div>


      {/* FIXED BOTTOM */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">

        <div className="flex gap-3 max-w-2xl mx-auto">

          {/* CHAT */}
          <Button
            variant="outline"
            className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={() =>
              navigate(
                `/chat/${creator.id}`
              )
            }
          >

            <MessageCircle className="w-4 h-4 mr-2" />

            Chat

          </Button>

{/* FIXED BOTTOM */}
<div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t p-4 z-50">

  <div className="flex gap-3 max-w-3xl mx-auto">

    {isOwner ? (

      <Button
        className="
          w-full
          rounded-full
          bg-primary text-primary-foreground
          hover:
          hover:
          hover:
          text-white
        "
        onClick={() =>
          navigate("/creator-setup")
        }
      >
        Edit Profile
      </Button>

    ) : (

      <>
        <Button
          variant="outline"
          className="
            flex-1
            rounded-full
            border-primary
            text-primary
          "
          onClick={() =>
            navigate(`/chat/${creator.id}`)
          }
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat
        </Button>

        <Button
          className="
            flex-1
            rounded-full
            bg-primary text-primary-foreground
            hover:
            hover:
            hover:
            text-white
          "
          onClick={() =>
            navigate(`/booking/${creator.id}`)
          }
        >
          Book Now
        </Button>

        <Button
  variant="outline"
  onClick={() =>
    navigate(`/review/${creator.id}`)
  }
  className="
    flex-1
    rounded-full
    border-yellow-500
    text-yellow-600
    hover:bg-yellow-50
    transition-all
  "
>
  ⭐ Review
</Button>
      </>

    )}

  </div>

</div>
          

        </div>

      </div>

    </div>
  );
}