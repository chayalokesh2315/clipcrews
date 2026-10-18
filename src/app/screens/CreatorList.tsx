import HeartButton from "../components/HeartButton";
import VerifiedBadge from "../components/VerifiedBadge";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Star,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "../components/ui/card";

import { Button } from "../components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";

import { Label } from "../components/ui/label";

import { Slider } from "../components/ui/slider";


// 🔥 FIREBASE
import { db } from "../../firebase";

import {
  collection,
  getDocs,
} from "firebase/firestore";


export default function CreatorList() {

  const navigate = useNavigate();

  const { category, subcategory } =
    useParams();

  const decodedSubcategory = subcategory
    ? decodeURIComponent(subcategory)
    : "";


  const [creators, setCreators] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);


  // 🔥 FILTERS
  const [priceRange, setPriceRange] =
    useState([0, 10000]);

  const [minRating, setMinRating] =
    useState(0);


  // 🔥 FETCH CREATORS
  useEffect(() => {

    const fetchCreators = async () => {

      try {

        const querySnapshot = await getDocs(
          collection(db, "creators")
        );

        const creatorData =
          querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        setCreators(creatorData);

      } catch (error) {

        console.log(error);

      }

      setLoading(false);
    };

    fetchCreators();

  }, []);


  // 🔥 FILTER LOGIC
  const filteredCreators = useMemo(() => {

    return creators.filter(
      (creator) =>

        creator.category === category &&

        creator.subCategory ===
          decodedSubcategory &&

        creator.price >= priceRange[0] &&

        creator.price <= priceRange[1] &&

        creator.rating >= minRating
    );

  }, [
    creators,
    category,
    decodedSubcategory,
    priceRange,
    minRating,
  ]);


  // 🔥 LOADING
  if (loading) {

    return (
      <div className="min-h-screen bg-card flex items-center justify-center">

        <p className="text-muted-foreground">
          Loading creators...
        </p>

      </div>
    );
  }


  return (
    <div className="min-h-screen bg-card">

      {/* HEADER */}
      <div className="bg-blue-600 text-white p-6 pb-8">

        <div className="flex items-center gap-4 mb-6">

          <button
            onClick={() =>
              navigate("/categories")
            }
            className="p-2 hover:bg-blue-500 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>


          <div className="flex-1">

            <h1 className="text-2xl mb-1">
              {decodedSubcategory}
            </h1>

            <p className="text-blue-100">

              {filteredCreators.length}
              {" "}professionals found

            </p>

          </div>


          {/* FILTER SHEET */}
          <Sheet>

            <SheetTrigger asChild>

              <button className="p-2 hover:bg-blue-500 rounded-full transition-colors">

                <SlidersHorizontal className="w-5 h-5" />

              </button>

            </SheetTrigger>


            <SheetContent>

              <SheetHeader>

                <SheetTitle>
                  Filters
                </SheetTitle>

                <SheetDescription>
                  Filter creators by price and rating
                </SheetDescription>

              </SheetHeader>


              <div className="space-y-6 mt-6">

                {/* PRICE */}
                <div className="space-y-3">

                  <Label>

                    Price Range:
                    {" "}₹{priceRange[0]}
                    {" - "}
                    ₹{priceRange[1]}

                  </Label>

                  <Slider
                    min={0}
                    max={10000}
                    step={500}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="w-full"
                  />

                </div>


                {/* RATING */}
                <div className="space-y-3">

                  <Label>

                    Minimum Rating:
                    {" "}
                    {minRating.toFixed(1)} ⭐

                  </Label>

                  <Slider
                    min={0}
                    max={5}
                    step={0.5}
                    value={[minRating]}
                    onValueChange={(val) =>
                      setMinRating(val[0])
                    }
                    className="w-full"
                  />

                </div>


                {/* RESET */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {

                    setPriceRange([
                      0,
                      10000,
                    ]);

                    setMinRating(0);

                  }}
                >
                  Reset Filters
                </Button>

              </div>

            </SheetContent>

          </Sheet>

        </div>

      </div>


      {/* CREATOR LIST */}
      <div className="p-6 -mt-4 space-y-4">

        {filteredCreators.length === 0 ? (

          <Card className="border-border">

            <CardContent className="p-8 text-center">

              <p className="text-muted-foreground">

                No creators found matching your filters

              </p>


              <Button
                variant="link"
                onClick={() => {

                  setPriceRange([
                    0,
                    10000,
                  ]);

                  setMinRating(0);

                }}
              >
                Reset Filters
              </Button>

            </CardContent>

          </Card>

        ) : (

          filteredCreators.map((creator) => (

            <Card
              key={creator.id}
              className="relative border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() =>
                navigate(`/creator/${creator.id}`)
              }
            >

              <HeartButton id={creator.id} />
              <CardContent className="p-4">

                <div className="flex gap-4 items-start">

{/* PROFILE IMAGE */}
<div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">

  <img
    src={creator.profileImage}
    alt={creator.name}
    className="w-full h-full object-cover"
  />
  <p className="text-xs">
  {creator.profileImage?.substring(0, 30)}
</p>

</div>


                  {/* DETAILS */}
                  <div className="flex-1 min-w-0">

                    <h3 className="text-lg text-foreground mb-1">

                      {creator.name}{creator.verified && <VerifiedBadge />}

                    </h3>


                    <p className="text-sm text-muted-foreground mb-2">

                      {creator.subCategory}

                    </p>


                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">

                      <div className="flex items-center gap-1">

                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />

                        <span>
                          {creator.rating || 0}
                        </span>

                        <span className="text-muted-foreground">

                          ({creator.totalReviews || 0})

                        </span>

                      </div>


                      <span className="text-gray-300">
                        •
                      </span>


                      <span>

                        {creator.experience || 0}
                        {" "}years exp

                      </span>

                    </div>


                    {/* LOCATION */}
                    {creator.location && (

                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">

                        <MapPin className="w-4 h-4" />

                        <span>
                          {creator.location}
                        </span>

                      </div>

                    )}


                    <div className="flex items-center justify-between">

                      <span className="text-xl text-blue-600">

                       ₹{creator.price?.toLocaleString()}

<span className="text-xs text-muted-foreground">
  {" "}
  / 4 hrs
</span>
                      </span>


                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        View Profile
                      </Button>

                    </div>

                  </div>

                </div>

              </CardContent>

            </Card>

          ))
        )}

      </div>

    </div>
  );
}