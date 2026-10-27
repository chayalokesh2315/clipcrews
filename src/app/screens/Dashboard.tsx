import QuickLinks from "../components/QuickLinks";
import { notify } from "../lib/notify";
import { toast } from "sonner";
import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Camera,
  Upload,
  Calendar,
  IndianRupee,
  LogOut,
  Trash2,
  MessageCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "../components/ui/card";

import { Button } from "../components/ui/button";


// 🔥 FIREBASE
import {
  auth,
  db,
} from "../../firebase";

import {
  signOut,
  onAuthStateChanged,
  deleteUser,
} from "firebase/auth";

import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";


export default function Dashboard() {

  const navigate =
    useNavigate();

  const [creator,
    setCreator] =
    useState<any>(null);

  const [bookings,
    setBookings] =
    useState<any[]>([]);

  const [loading,
    setLoading] =
    useState(true);


  // 🔥 FETCH DATA
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

            // 🔥 CREATOR DATA
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

              setCreator({
                id:
                  creatorDoc.id,
                ...creatorDoc.data(),
              });

            } else {

              toast(
                "Only creators can access dashboard"
              );

              navigate(
                "/categories"
              );

              return;
            }


            // 🔥 BOOKINGS
            const bookingsQuery =
              query(
                collection(
                  db,
                  "bookings"
                ),
                where(
                  "creatorId",
                  "==",
                  user.uid
                )
              );

            const bookingsSnapshot =
              await getDocs(
                bookingsQuery
              );

            const bookingsData =
              bookingsSnapshot.docs.map(
                (doc) => ({
                  id: doc.id,
                  ...doc.data(),
                })
              );

            setBookings(
              bookingsData
            );

          } catch (error) {

            console.log(error);

          }

          setLoading(false);
        }
      );

    return () =>
      unsubscribe();

  }, [navigate]);


  // 🔥 LOGOUT
  const handleLogout =
    async () => {

      await signOut(auth);

      navigate("/login");
    };


  // 🔥 DELETE ACCOUNT
  const handleDeleteAccount =
    async () => {

      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete your account?"
        );

      if (!confirmDelete)
        return;

      try {

        const user =
          auth.currentUser;

        if (!user)
          return;


        // 🔥 DELETE USER DOC
        await deleteDoc(
          doc(
            db,
            "users",
            user.uid
          )
        );


        // 🔥 DELETE CREATOR DOC
        await deleteDoc(
          doc(
            db,
            "creators",
            user.uid
          )
        );


        // 🔥 DELETE AUTH
        await deleteUser(
          user
        );

        toast(
          "Account deleted successfully"
        );

        navigate("/login");

      } catch (
        error: any
      ) {

        console.log(error);

        toast(
          error.message
        );
      }
    };
const updateBookingStatus =
  async (
    bookingId: string,
    status: string
  ) => {

    await updateDoc(
      doc(
        db,
        "bookings",
        bookingId
      ),
      {
        status,
      }
    );

    const bk: any = bookings.find((x: any) => x.id === bookingId);
    if (bk) notify(bk.customerId, `Booking ${status}`, `${bk.creatorName} ${status} your request.`);
    setBookings(
      bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status,
            }
          : b
      )
    );
  };

  // 🔥 LOADING
  if (loading) {

    return (
      <div className="min-h-screen bg-card flex items-center justify-center">

        <p className="text-muted-foreground">

          Loading Dashboard...

        </p>

      </div>
    );
  }


  return (
    <div className="min-h-screen bg-muted">
      <QuickLinks role="creator" />

      {/* HEADER */}
<div className="bg-primary text-primary-foreground text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            {/* PROFILE IMAGE */}
<div className="w-full h-full flex items-center justify-center text-primary text-xl font-bold">
              {creator?.profileImage ? (

                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
  <img
    src={creator.profileImage}
    alt=""
    className="w-full h-full object-cover"
  />
</div>

              ) : (

                <div className="w-full h-full flex items-center justify-center text-blue-600 text-xl font-bold">

                  {creator?.name?.charAt(
                    0
                  )}

                </div>

              )}

            </div>


            <div>

              <h1 className="text-2xl">

                {creator?.name}

              </h1>

              <p className="text-blue-100">

                {
                  creator?.subCategory
                }

              </p>

            </div>

          </div>


          <button
            onClick={
              handleLogout
            }
className="p-2 hover:bg-card/20 rounded-xl transition"          >

            <LogOut className="w-5 h-5" />

          </button>

        </div>

      </div>


      {/* CONTENT */}
      <div className="p-6 space-y-6">

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4">

          <Card className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-lg border-white/50">

            <CardContent className="p-4">

              <div className="flex items-center gap-3">

<Calendar className="w-8 h-8 text-primary" />
                <div>

                  <p className="text-muted-foreground text-sm">

                    Total Bookings

                  </p>

                  <h2 className="text-2xl">

                    {
                      bookings.length
                    }

                  </h2>

                </div>

              </div>

            </CardContent>

          </Card>


          <Card className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-lg border-white/50">

            <CardContent className="p-4">

              <div className="flex items-center gap-3">

<IndianRupee className="w-8 h-8 text-primary" />
                <div>

                  <p className="text-muted-foreground text-sm">

                    Price

                  </p>

                  <h2 className="
text-3xl
font-bold
bg-primary text-primary-foreground
bg-clip-text
text-transparent
">
  ₹{creator?.price}
</h2>

                </div>

              </div>

            </CardContent>

          </Card>
          <Card className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-lg border-white/50">
  <CardContent className="p-4">

    <div className="flex items-center gap-3">

      <span className="text-3xl">
        ⭐
      </span>

      <div>
        <p className="text-muted-foreground text-sm">
          Rating
        </p>

        <h2 className="text-2xl">
          {creator?.rating || 0}
        </h2>
      </div>

    </div>

  </CardContent>
</Card>

        </div>


        {/* ACTIONS */}
        <Card className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-lg border-white/50">

          <CardContent className="p-6">

            <h2 className="text-xl mb-4">

              Quick Actions

            </h2>

            <div className="grid grid-cols-3 gap-4">

              {/* PORTFOLIO */}
              <button
                onClick={() =>
                  navigate(
                    "/portfolio-upload"
                  )
                }
className="
flex flex-col items-center gap-2 p-5
bg-card
rounded-2xl
border border-border
shadow-sm
hover:shadow-lg
transition-all
"              >

<Upload className="w-6 h-6 text-primary" />
                <span>

                  Portfolio

                </span>

              </button>


              {/* PROFILE */}
              <button
                onClick={() =>
                  navigate(
                    `/creator/${creator.id}`
                  )
                }
                className="flex flex-col items-center gap-2 p-4 bg-muted hover:bg-gray-200 rounded-xl transition-colors"
              >

<Camera className="w-6 h-6 text-primary" />
                <span>

                  View Profile

                </span>

              </button>

              {/* MESSAGES */}
{/* MESSAGES */}
<button
  onClick={() =>
    navigate("/creator-messages")
  }
  className="flex flex-col items-center gap-2 p-4 bg-muted hover:bg-gray-200 rounded-xl transition-colors"
>
<MessageCircle className="w-6 h-6 text-orange-500" />
  <span>
    Messages
  </span>
</button>

            </div>

          </CardContent>

        </Card>


        {/* BOOKINGS */}
        <Card className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-lg border-white/50">

          <CardContent className="p-6">

            <h2 className="text-xl mb-4">

              Recent Bookings

            </h2>


            {bookings.length === 0 ? (

              <p className="text-muted-foreground">

                No bookings yet

              </p>

            ) : (

              <div className="space-y-4">

                {bookings.map(
                  (booking) => (

                    <div
                      key={
                        booking.id
                      }
className="
bg-card
rounded-2xl
border
border-border
p-5
shadow-sm
hover:shadow-md
transition
"                    >

                      <div className="flex justify-between items-start">

                        <div>

                          <h3 className="font-medium">

                            {
                              booking.customerName
                            }

                          </h3>
                          <div className="flex gap-2 mt-2">

 
<Button
  size="sm"
  variant="outline"
  onClick={() =>
    navigate(
      `/customer/${booking.customerId}`
    )
  }
>
  View Customer
</Button>

</div>

                          <p className="text-sm text-muted-foreground">
  {booking.date} • {booking.startTime} - {booking.endTime}
</p>

                        </div>

                       <div>

  {booking.status ===
  "pending" ? (

    <div className="flex gap-2">

      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700"
        onClick={() =>
          updateBookingStatus(
            booking.id,
            "accepted"
          )
        }
      >
        Accept
      </Button>

     <Button
  size="sm"
  className="bg-red-600 hover:bg-red-700 text-white"
  onClick={() =>
    updateBookingStatus(
      booking.id,
      "rejected"
    )
  }
>
  Reject
</Button>
    </div>

  ) : (

    <span
      className={`px-2 py-1 rounded-full text-sm ${
        ["accepted", "paid", "completed"].includes(booking.status)
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >

      {booking.status}

    </span>

  )}

</div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </CardContent>

        </Card>


      {/* DELETE ACCOUNT */}
<button
  onClick={
    handleDeleteAccount
  }
  className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
>

  <Trash2 className="w-4 h-4" />

  Delete Account

</button>

      </div>

    </div>
  );
}