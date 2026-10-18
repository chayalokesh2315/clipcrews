import { getDocs, query, where, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { db, auth } from "../../firebase";

import {
   doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export default function AddReview() {

  const navigate =
    useNavigate();

  const { creatorId } =
    useParams();

  const [rating,
    setRating] =
    useState(5);

  const [comment,
    setComment] =
    useState("");

 const submitReview =
  async () => {

    if (!comment.trim())
      return;

    try {

      const userDoc =
        await getDoc(
          doc(
            db,
            "users",
            auth.currentUser!.uid
          )
        );

      const userData =
        userDoc.data();

      await addDoc(
        collection(
          db,
          "reviews"
        ),
        {
          creatorId,

          customerId:
            auth.currentUser?.uid,

          customerName:
            userData?.name ||
            "Customer",

          rating,

          comment,

          createdAt:
            serverTimestamp(),
        }
      );
      const all = await getDocs(query(collection(db, "reviews"), where("creatorId", "==", creatorId)));
      const rs = all.docs.map((d) => Number(d.data().rating) || 0);
      await updateDoc(doc(db, "creators", creatorId as string), {
        rating: rs.reduce((a, b) => a + b, 0) / (rs.length || 1),
        totalReviews: rs.length,
      });

      toast(
        "Review Added!"
      );

      navigate(-1);

    } catch (error) {

      toast(
        "Failed to add review"
      );
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br  via-white ">

    {/* HEADER */}
    <div className="bg-primary text-primary-foreground text-white p-8 rounded-b-3xl shadow-lg">

      <h1 className="text-4xl font-bold mb-2">
        Add Review
      </h1>

      <p className="text-white/90">
        Share your experience with this creator
      </p>

    </div>

    <div className="p-6">

      <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-lg p-6">

        {/* RATING */}
        <label className="block text-lg font-semibold mb-3">
          Rating
        </label>

        <select
          value={rating}
          onChange={(e) =>
            setRating(Number(e.target.value))
          }
          className="
            w-full
            rounded-2xl
            border
            border-border
            p-4
            mb-6
            focus:border-primary
            focus:outline-none
          "
        >
          <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
          <option value={4}>⭐⭐⭐⭐ Very Good</option>
          <option value={3}>⭐⭐⭐ Good</option>
          <option value={2}>⭐⭐ Fair</option>
          <option value={1}>⭐ Poor</option>
        </select>

        {/* COMMENT */}
        <label className="block text-lg font-semibold mb-3">
          Your Review
        </label>

        <textarea
          value={comment}
          onChange={(e) =>
            setComment(e.target.value)
          }
          rows={6}
          placeholder="Tell others about your experience..."
          className="
            w-full
            rounded-2xl
            border
            border-border
            p-4
            focus:border-primary
            focus:outline-none
          "
        />

        {/* BUTTON */}
        <button
          onClick={submitReview}
          className="
            mt-6
            w-full
            h-14
            rounded-full
            bg-primary text-primary-foreground
            text-white
            font-semibold
            shadow-lg
            hover:
            hover:
            hover:
            transition
          "
        >
          Submit Review
        </button>

      </div>

    </div>

  </div>
);
}