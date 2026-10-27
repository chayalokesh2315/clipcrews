import { toast } from "sonner";
import { useEffect, useState } from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import { auth,db } from "../../firebase";

import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function CustomerProfile() {

  const {
    id,
    bookingId,
  } = useParams();

  const navigate =
    useNavigate();
    const startChat =
  async () => {

    const creatorId =
      auth.currentUser?.uid;

    if (
      !creatorId ||
      !id
    )
      return;

    const chatId =
      [creatorId, id]
        .sort()
        .join("_");

    await setDoc(
      doc(
        db,
        "chats",
        chatId
      ),
      {
        creatorId,
        customerId: id,
        updatedAt:
          serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    navigate(
      `/creator-chat/${chatId}`
    );
  };

  const [customer,
    setCustomer] =
    useState<any>(null);

  const [bookingStatus,
    setBookingStatus] =
    useState("pending");
    

  const updateBookingStatus =
    async (
      status: string
    ) => {
      console.log("Booking ID:", bookingId);
console.log("Status:", status);

      if (!bookingId)
        return;

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

      setBookingStatus(
        status
      );

      toast(
        `Booking ${status}`
      );
    };

  useEffect(() => {

    const fetchData =
      async () => {

        if (!id) return;

        try {

          // Customer Data
          const customerRef =
            await getDoc(
              doc(
                db,
                "users",
                id
              )
            );

          if (
            customerRef.exists()
          ) {

            setCustomer(
              customerRef.data()
            );

          }

          // Booking Data
          if (
            bookingId
          ) {

            const bookingRef =
              await getDoc(
                doc(
                  db,
                  "bookings",
                  bookingId
                )
              );

            if (
              bookingRef.exists()
            ) {

              setBookingStatus(
                bookingRef.data()
                  .status ||
                  "pending"
              );

            }
          }

        } catch (error) {

          console.log(
            error
          );

        }
      };

    fetchData();

  }, [id, bookingId]);

  if (!customer) {

    return (

      <div className="p-6">

        Loading...

      </div>

    );
  }

  return (

    <div className="min-h-screen bg-muted p-6">

      <div className="max-w-md mx-auto bg-card rounded-xl shadow p-6">

        <img
          src={
            customer.profileImage
          }
          alt={
            customer.name
          }
          className="w-24 h-24 rounded-full object-cover mx-auto"
        />

        <h1 className="text-2xl text-center mt-4">

          {customer.name}

        </h1>

        <p className="text-center text-muted-foreground">

          {customer.email}

        </p>

        <p className="text-center mt-2">

          Role:
          {" "}
          {customer.role}

        </p>

        {/* ACTIONS */}

        {bookingStatus ===
        "pending" ? (

          <div className="flex gap-2 mt-6">

            <button
  onClick={startChat}
className="w-full h-12 bg-primary text-primary-foreground text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3">

  Chat
</button>

            

          </div>

        ) : bookingStatus ===
          "accepted" ? (

          <div className="mt-6">

            <p className="text-green-600 font-medium text-center mb-4">

              Booking Accepted ✅

            </p>

            <button
  onClick={startChat}
  className="w-full bg-primary text-white py-2 rounded-lg"
>
  Chat
</button>           
  
           
          </div>

        ) : (

          <div className="mt-6">

            <p className="text-red-600 font-medium text-center">

              Booking Rejected ❌

            </p>

          </div>

        )}

      </div>

    </div>

  );
}