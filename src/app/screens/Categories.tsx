import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Camera,
  Search,
  Grid3X3,
  List,
  Star,
  MapPin,
  User,
} from "lucide-react";

import { Input } from "../components/ui/input";

import { Button } from "../components/ui/button";

import {
  Card,
  CardContent,
} from "../components/ui/card";

import {
  Badge,
} from "../components/ui/badge";


// 🔥 FIREBASE
import {
  auth,
  db,
} from "../../firebase";

import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";


const norm = (s: any) => String(s ?? "").trim().toLowerCase();
const titleCase = (s: string) => s.trim().replace(/\b\w/g, (m) => m.toUpperCase());

export default function Categories() {
  const [params] = useSearchParams();

  const navigate = useNavigate();

  const [creators, setCreators] =
    useState<any[]>([]);

  const [filteredCreators,
    setFilteredCreators] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm,
    setSearchTerm] =
    useState(params.get("search") ?? "");

  const [selectedCategory,
    setSelectedCategory] = useState(norm(params.get("category")) || "All");

  const [viewMode,
    setViewMode] =
    useState("grid");

  // 🔥 USER ROLE
  const [role, setRole] =
    useState("");


  // 🔥 CATEGORY LIST
  // roles come from what creators actually entered; nothing is shown until a creator adds one
  const categories = useMemo(() => {
    const m = new Map<string, { label: string; count: number }>();
    creators.forEach((cr: any) => {
      const k = norm(cr.category);
      if (!k) return;
      const e = m.get(k);
      if (e) e.count++; else m.set(k, { label: titleCase(String(cr.category)), count: 1 });
    });
    return [...m.entries()].sort((a, b) => b[1].count - a[1].count).map(([key, v]) => ({ key, ...v }));
  }, [creators]);


  // 🔥 FETCH USER ROLE
  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          if (!user) return;

          try {

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

            setRole(
              userData?.role
            );

          } catch (error) {

            console.log(error);

          }
        }
      );

    return () => unsubscribe();

  }, []);


  // 🔥 FETCH CREATORS
  useEffect(() => {

    const fetchCreators =
      async () => {

        try {

          const creatorsRef =
            collection(
              db,
              "creators"
            );

          const snapshot =
            await getDocs(
              creatorsRef
            );

          const creatorData =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );

          setCreators(
            creatorData
          );

          setFilteredCreators(
            creatorData
          );

        } catch (error) {

          console.log(error);

        }

        setLoading(false);
      };

    fetchCreators();

  }, []);


  // 🔥 FILTER CREATORS
  useEffect(() => {

    let filtered =
      creators;

    // CATEGORY FILTER
    if (
      selectedCategory !==
      "All"
    ) {

      filtered =
        filtered.filter(
          (creator: any) =>
            norm(creator.category) === selectedCategory
        );
    }

    // SEARCH FILTER
    if (searchTerm) {

      filtered =
        filtered.filter(
          (creator: any) =>
            creator.name
              ?.toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              ) ||
            creator.subCategory
              ?.toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              )
        );
    }

    setFilteredCreators(
      filtered
    );

  }, [
    creators,
    searchTerm,
    selectedCategory,
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
  <div className="min-h-screen bg-gradient-to-br  via-white  p-6">

    {/* HEADER */}
<div className="bg-card/80 backdrop-blur-md rounded-full px-8 py-4 shadow-lg flex items-center justify-between mb-6">

  {/* LEFT */}
  <div className="flex items-center gap-3">
    <Camera className="w-6 h-6 text-primary" />

    <h1 className="fancy-heading text-3xl text-foreground">
      Clip Crew
    </h1>
  </div>

  {/* RIGHT */}
  <button
    onClick={() => {
      if (role === "creator") {
        navigate("/dashboard");
      } else {
        navigate("/customer-dashboard");
      }
    }}
    className="p-2 rounded-full hover:bg-secondary transition"
  >
    <User className="w-6 h-6 text-foreground" />
  </button>

</div>
        


        {/* SEARCH */}
                <div className="max-w-7xl mx-auto mb-6">

        <div className="relative">

<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search creators..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
      className="pl-12 bg-card/90 text-black rounded-2xl border-0 shadow-md h-14"
          />

        </div>

      </div>


      {/* CONTENT */}
      <div className="p-6 -mt-4">

        {/* FILTERS */}
        <div className="flex items-center justify-between mb-6">

          {/* CATEGORY BUTTONS */}
          <div className="flex gap-2 overflow-x-auto">

            {categories.length > 0 &&
                [{ key: "All", label: "All" }, ...categories].map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => setSelectedCategory(chip.key)}
                    aria-pressed={selectedCategory === chip.key}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === chip.key
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}

          </div>


          {/* VIEW TOGGLE */}
          <div className="flex gap-2">

            <button
              onClick={() =>
                setViewMode(
                  "grid"
                )
              }
              className={`p-2 rounded-lg ${
                viewMode ===
                "grid"
                      ? "bg-primary text-primary-foreground text-white shadow-md"
                  : "bg-muted text-foreground"
              }`}
            >

              <Grid3X3 className="w-4 h-4" />

            </button>


            <button
              onClick={() =>
                setViewMode(
                  "list"
                )
              }
              className={`p-2 rounded-lg ${
                viewMode ===
                "list"
                  ? "bg-primary text-primary-foreground text-white shadow-md"
                  : "bg-muted text-foreground"
              }`}
            >

              <List className="w-4 h-4" />

            </button>

          </div>

        </div>


        {/* CREATOR LIST */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 gap-4"
              : "space-y-4"
          }
        >

          {filteredCreators.length === 0 ? (

            <Card>

              <CardContent className="p-8 text-center">

                <p className="text-muted-foreground">

                  No creators found

                </p>

              </CardContent>

            </Card>

          ) : (

            filteredCreators.map(
              (creator: any) => (

                <Card
                  key={creator.id}
                  className="border-border hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/creator/${creator.id}`
                    )
                  }
                >

                  <CardContent className="p-4">

                    <div className="flex gap-4">

                      {/* IMAGE */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">

                        {creator.profileImage ? (

                          <img
                            src={
                              creator.profileImage
                            }
                            alt={
                              creator.name
                            }
                            className="w-full h-full object-cover"
                          />

                        ) : (

                          <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-2xl">

                            {creator.name?.charAt(
                              0
                            )}

                          </div>

                        )}

                      </div>


                      {/* DETAILS */}
                      <div className="flex-1">

                        <div className="flex justify-between items-start mb-2">

                          <div>

                            <h3 className="text-lg text-foreground">

                              {creator.name}

                            </h3>

                            <p className="text-muted-foreground text-sm">

                              {
                                creator.subCategory
                              }

                            </p>

                          </div>


                          <Badge className="bg-secondary text-primary">

                            {creator.category}

                          </Badge>

                        </div>


                        {/* RATING */}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">

                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />

                          <span>

                            {creator.rating || 0}

                          </span>

                          <span>

                            (
                            {creator.totalReviews || 0}
                            )

                          </span>

                        </div>


                        {/* LOCATION */}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">

                          <MapPin className="w-4 h-4" />

                          <span>

                            {creator.location ||
                              "Unknown"}

                          </span>

                        </div>


                        {/* PRICE */}
                        <div className="flex justify-between items-center">

                          <span className="bg-primary text-primary-foreground bg-clip-text text-transparent text-xl font-bold">

                            ₹
                            {creator.price?.toLocaleString()}

                          </span>


                          <Button
                            size="sm"
                            className="bg-primary text-primary-foreground hover: hover: hover: text-white rounded-full"
                          >

                            View Profile

                          </Button>

                        </div>

                      </div>

                    </div>

                  </CardContent>

                </Card>
              )
            )
          )}

        </div>

      </div>

    </div>
    
  );

}
