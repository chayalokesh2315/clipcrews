import { toast } from "sonner";
import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  User,
  Calendar,
  Clock,
  LogOut,
  Trash2,
  Eye,
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
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";


export default function CustomerDashboard() {

  const navigate =
    useNavigate();

  const [customer,
    setCustomer] =
    useState<any>(null);

  const [bookings,
    setBookings] =
    useState<any[]>([]);

  const [loading,
    setLoading] =
    useState(true);


  // 🔥 FETCH DATA
  useEffect(() => {

    let requestId = 0;
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          const currentRequestId = ++requestId;
          setLoading(true);
          setCustomer(null);
          setBookings([]);

          if (!user) {

            navigate("/login");

            return;
          }

          try {

            // 🔥 CUSTOMER DATA
            const userDoc =
              await getDoc(
                doc(
                  db,
                  "users",
                  user.uid
                )
              );

            if (currentRequestId !== requestId) return;

            if (
              userDoc.exists()
            ) {

              setCustomer({
                id:
                  userDoc.id,
                ...userDoc.data(),
              });
            } else {

              setCustomer(null);

            }


            // 🔥 BOOKINGS
            const bookingsQuery =
              query(
                collection(
                  db,
                  "bookings"
                ),
                where(
                  "customerId",
                  "==",
                  user.uid
                )
              );

            const bookingsSnapshot =
              await getDocs(
                bookingsQuery
              );

            if (currentRequestId !== requestId) return;

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

          } finally {

            if (currentRequestId === requestId) {
              setLoading(false);
            }

          }
        }
      );

    return () => {
      requestId += 1;
      unsubscribe();
    };

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


        // 🔥 DELETE BOOKINGS
        const bookingsQuery =
          query(
            collection(
              db,
              "bookings"
            ),
            where(
              "customerId",
              "==",
              user.uid
            )
          );

        const bookingsSnapshot =
          await getDocs(
            bookingsQuery
          );

        for (const booking of bookingsSnapshot.docs) {

          await deleteDoc(
            doc(
              db,
              "bookings",
              booking.id
            )
          );
        }


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

      {/* HEADER */}
<div className="bg-primary text-primary-foreground text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            {/* PROFILE IMAGE */}
            <div className="w-14 h-14 rounded-full overflow-hidden bg-card">

              {customer?.profileImage ? (

                <img
                  src={
                    customer.profileImage
                  }
                  alt=""
                  className="w-full h-full object-cover"
                />

              ) : (

                <div className="w-full h-full flex items-center justify-center text-blue-600 text-xl font-bold">

                  {customer?.name?.charAt(
                    0
                  )}

                </div>

              )}

            </div>


            <div>

              <h1 className="text-2xl">

                {customer?.name}

              </h1>

              <p className="text-blue-100">

                Customer Dashboard

              </p>

            </div>

          </div>


          {/* LOGOUT */}
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
<Card className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-lg border-white/50">
          <CardContent className="p-6">

            <div className="flex items-center gap-4">

<Calendar className="w-10 h-10 text-primary" />
              <div>

                <p className="text-muted-foreground">

                  Total Bookings

                </p>

                <h2 className="text-3xl">

                  {bookings.length}

                </h2>

              </div>

            </div>

          </CardContent>

        </Card>


        {/* BOOKINGS */}
        <Card>

          <CardContent className="p-6">

            <h2 className="text-xl mb-4">

              My Bookings

            </h2>


            {bookings.length === 0 ? (

              <div className="text-center py-10">

  <div className="text-5xl mb-3">
    📅
  </div>

  <p className="text-muted-foreground">
    No bookings yet
  </p>

</div>

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

                      <div className="flex justify-between items-start mb-3">

                        <div>

                          <h3 className="font-medium text-lg">

                            {
                              booking.creatorName
                            }

                          </h3>

                          <p className="text-sm text-muted-foreground">

                            {
                              booking.serviceType
                            }

                          </p>

                        </div>


                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">

                          {
                            booking.status
                          }

                        </span>

                      </div>


                      <div className="space-y-2 text-sm text-muted-foreground">

                        <div className="flex items-center gap-2">

                          <Calendar className="w-4 h-4" />

                          <span>

                            {
                              booking.date
                            }

                          </span>

                        </div>


                        <div className="flex items-center gap-2">

                          <Clock className="w-4 h-4" />

                          <span>

                            {booking.startTime} - {booking.endTime}

                          </span>

                        </div>

                      </div>


                      {/* VIEW CREATOR */}
                      <Button
                        onClick={() =>
                          navigate(
                            `/creator/${booking.creatorId}`
                          )
                        }
className="
w-full
mt-4
rounded-full
bg-primary text-primary-foreground
hover:
hover:
hover:
text-white
"                      >

                        <Eye className="w-4 h-4 mr-2" />

                        View Creator

                      </Button>

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
className="
w-full
bg-red-500
hover:bg-red-600
text-white
p-4
rounded-2xl
flex
items-center
justify-center
gap-2
shadow-md
">

  <Trash2 className="w-4 h-4" />

  Delete Account

</button>

      </div>

    </div>
  );
}