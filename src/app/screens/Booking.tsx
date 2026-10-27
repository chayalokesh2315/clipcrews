import { notify } from "../lib/notify";
import { toast } from "sonner";
import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MessageSquare,
} from "lucide-react";

import { Button } from "../components/ui/button";

import {
  Card,
  CardContent,
} from "../components/ui/card";

import { Label } from "../components/ui/label";

import { Textarea } from "../components/ui/textarea";

import { Calendar } from "../components/ui/calendar";


// 🔥 FIREBASE
import {
  auth,
  db,
} from "../../firebase";

import { getDocs, query, where } from "firebase/firestore";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";


export default function Booking() {

  const navigate = useNavigate();

  const { creatorId } = useParams();

  const [creator, setCreator] =
    useState<any>(null);

  const [currentUser, setCurrentUser] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [bookingLoading, setBookingLoading] =
    useState(false);

  // 🔥 BOOKING DATA
  const [date, setDate] =
    useState<Date | undefined>(undefined);

  const [startTime, setStartTime] =
  useState("10:00");

const [endTime, setEndTime] =
  useState("14:00");

  const [message, setMessage] =
    useState("");

  // 🔥 FETCH DATA
  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          // 🚫 NOT LOGGED IN
          if (!user) {

            navigate("/login");

            return;
          }

          setCurrentUser(user);

          try {

            // 🔥 GET USER ROLE
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

            // 🚫 BLOCK CREATORS
            if (
              userData?.role ===
              "creator"
            ) {

              toast(
                "Creators cannot book services"
              );

              navigate("/dashboard");

              return;
            }

            // 🔥 FETCH CREATOR
            const creatorRef = doc(
              db,
              "creators",
              creatorId as string
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

            } else {

              setCreator(null);

            }

          } catch (error) {

            console.log(error);

          }

          setLoading(false);
        }
      );

    return () => unsubscribe();

  }, [creatorId, navigate]);

  // 🔥 BOOKING FUNCTION
  const handleBooking =
    async () => {

      if (!date) {

        toast(
          "Please select date"
        );

        return;
      }

      if (!creator) return;

      setBookingLoading(true);

      try {

        // 🔥 FETCH CUSTOMER NAME
        const userDoc =
          await getDoc(
            doc(
              db,
              "users",
              currentUser.uid
            )
          );

        const userData =
          userDoc.data();

        const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        const toMin = (t: string) => { const m = String(t).match(/(\d+):(\d+)\s*(AM|PM)?/i); if (!m) return NaN; let h = +m[1]; if (m[3]) h = (h % 12) + (/pm/i.test(m[3]) ? 12 : 0); return h * 60 + +m[2]; };
        if ((creator.unavailable ?? []).includes(iso)) { toast("The creator is not available on that day."); return; }
        const s = toMin(startTime), e = toMin(endTime);
        const busy = await getDocs(query(collection(db, "busy"), where("creatorId", "==", creator.id), where("dateISO", "==", iso)));
        if (busy.docs.some((d) => s < d.data().endMin && e > d.data().startMin)) {
          toast("That time slot is already booked. Please choose another.");
          return;
        }
        // 🔥 SAVE BOOKING
        await addDoc(
          collection(
            db,
            "bookings"
          ),
          {
            customerId:
              currentUser.uid,

            customerName:
              userData?.name ||
              "Customer",

            customerEmail:
              currentUser.email,

            creatorId:
              creator.id,

            creatorName:
              creator.name,

            serviceType:
              creator.subCategory,

            date:
              date.toLocaleDateString(),
            dateISO: iso,

           startTime,
endTime,
totalAmount:
  calculateAmount(),

            message,

            amount:
              creator.price,

            status:
              "pending",

            createdAt:
              serverTimestamp(),
          }
        );

        await addDoc(collection(db, "busy"), { creatorId: creator.id, customerId: currentUser.uid, dateISO: iso, startMin: s, endMin: e });
        await notify(creator.id, "New booking request", `${userData?.name || "A customer"} requested ${date.toLocaleDateString()}.`);
        toast(
          "Booking request sent successfully!"
        );

        navigate(
          "/categories"
        );

      } catch (error) {

        console.log(error);

        toast(
          "Booking failed"
        );

      }

      setBookingLoading(false);
    };

  // 🔥 LOADING
  if (loading) {

    return (
      <div className="min-h-screen bg-card flex items-center justify-center">

        <p className="text-muted-foreground">

          Loading booking...

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
  

  // 🔥 TIME SLOTS
 const calculateAmount = () => (creator ? Number(creator.price) || 0 : 0); // lump sum per project, set by the creator within their role's range

  return (
    <div className="min-h-screen bg-gradient-to-br  via-white ">

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

        <h1 className="fancy-heading text-4xl mb-2">

          Book Service

        </h1>

        <p className="text-blue-100">

          Schedule with{" "}
          {creator.name}

        </p>

      </div>

      <div className="p-6 -mt-4">

        {/* CREATOR INFO */}
        <Card className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-lg border-white/50 mb-6">

          <CardContent className="p-4">

            <div className="flex gap-4">

              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted shrink-0">

  <img
    src={
      creator.profileImage?.trim()
        ? creator.profileImage
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
            creator.name || "Creator"
          )}&background=7c3aed&color=fff&size=200`
    }
    alt={creator.name}
    className="w-full h-full object-cover"
    onError={(e) => {
      e.currentTarget.src =
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          creator.name || "Creator"
        )}&background=7c3aed&color=fff&size=200`;
    }}
  />

</div>

              <div className="flex-1">

                <h3 className="text-lg text-foreground">

                  {creator.name}

                </h3>

                <p className="text-muted-foreground text-sm mb-2">

                  {creator.subCategory}

                </p>

                <p className="
  text-2xl
  font-bold
  bg-primary text-primary-foreground
  bg-clip-text
  text-transparent
">
  ₹{creator.price?.toLocaleString()}
</p>

              </div>

            </div>

          </CardContent>

        </Card>

        {/* DATE */}
        <Card className="border-border mb-6">

          <CardContent className="p-6">

            <div className="flex items-center gap-2 mb-4">

              <CalendarIcon className="w-5 h-5 text-primary" />

              <h3 className="text-lg text-foreground">

                Select Date

              </h3>

            </div>

        <Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  disabled={(date) => {
    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    return date < today;
  }}
  initialFocus
  className="rounded-md border border-border mx-auto"
/>

{date && (

  <div className="mt-4 p-3 bg-secondary border border-primary rounded-lg">

    <p className="text-primary font-medium">

      Selected Date:
      {" "}
      {date.toLocaleDateString()}

    </p>

  </div>

)}

          </CardContent>

        </Card>

        {/* TIME */}
       {/* TIME */}
<Card className="border-border mb-6">

  <CardContent className="p-6">

    <div className="flex items-center gap-2 mb-4">

      <Clock className="w-5 h-5 text-primary" />

      <h3 className="text-lg text-foreground">

        Select Time Range

      </h3>

    </div>

    <div className="grid grid-cols-2 gap-4">

      <div>

        <Label>
          Start Time
        </Label>

        <input
          type="time"
          value={startTime}
          onChange={(e) =>
            setStartTime(
              e.target.value
            )
          }
          className="w-full border rounded-lg p-3 mt-2"
        />

      </div>

      <div>

        <Label>
          End Time
        </Label>

        <input
          type="time"
          value={endTime}
          onChange={(e) =>
            setEndTime(
              e.target.value
            )
          }
          className="w-full border rounded-lg p-3 mt-2"
        />

      </div>

    </div>

  </CardContent>

</Card>

        {/* MESSAGE */}
        <Card className="border-border mb-6">

          <CardContent className="p-6">

            <div className="flex items-center gap-2 mb-4">

<MessageSquare className="w-5 h-5 text-primary" />
              <Label
                htmlFor="message"
                className="text-lg text-foreground"
              >

                Additional Message
                (Optional)

              </Label>

            </div>

            <Textarea
              id="message"
              placeholder="Tell the creator about your requirements..."
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              className="min-h-32"
            />

          </CardContent>

        </Card>

        {/* SUMMARY */}
        <Card className="border-border mb-6">

          <CardContent className="p-6">

            <h3 className="text-lg text-foreground mb-4">

              Booking Summary

            </h3>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between">

                <span className="text-muted-foreground">

                  Service

                </span>

                <span className="text-foreground">

                  {creator.subCategory}

                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-muted-foreground">

                  Date

                </span>

                <span className="text-foreground">

                  {date
                    ? date.toLocaleDateString()
                    : "Not selected"}

                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-muted-foreground">

                  Time

                </span>

                <span className="text-foreground">

  {startTime}
  {" - "}
  {endTime}

</span>

              </div>

              <div className="border-t border-border pt-3 flex justify-between">

                <span className="text-foreground">

                  Total Amount

                </span>

                <span className="text-2xl font-bold bg-primary text-primary-foreground bg-clip-text text-transparent">

                  
                  ₹
{calculateAmount().toLocaleString()}

                </span>

              </div>

            </div>

          </CardContent>

        </Card>

        {/* BUTTON */}
        <Button
          onClick={handleBooking}
          disabled={bookingLoading}
          className="w-full bg-primary text-primary-foreground hover: hover: hover: text-white h-14 text-lg rounded-full shadow-lg"
        >

          {bookingLoading
            ? "Booking..."
            : "Confirm Booking"}

        </Button>

      </div>


    </div>
  );
}