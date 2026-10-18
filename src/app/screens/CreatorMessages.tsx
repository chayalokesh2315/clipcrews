import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../../firebase";

export default function CreatorMessages() {

  const navigate =
    useNavigate();

  const [chats,
    setChats] =
    useState<any[]>([]);

  useEffect(() => {

    const fetchChats =
      async () => {

        const user =
          auth.currentUser;

        if (!user)
          return;

        const q =
          query(
            collection(
              db,
              "chats"
            ),
            where(
              "creatorId",
              "==",
              user.uid
            )
          );

        const snapshot =
          await getDocs(q);

        const data =
  await Promise.all(

    snapshot.docs.map(
      async (chatDoc) => {

        const chatData =
          chatDoc.data();

        let customer =
          null;

        if (
          chatData.customerId
        ) {

          const customerDoc =
            await getDoc(
              doc(
                db,
                "users",
                chatData.customerId
              )
            );

          if (
            customerDoc.exists()
          ) {

            customer =
              customerDoc.data();

          }
        }

        return {

          id:
            chatDoc.id,

          ...chatData,

          customer,

        };
      }
    )
  );


        setChats(data);
      };

    fetchChats();

  }, []);

  return (
<div className="min-h-screen bg-gradient-to-br  via-white  p-6">
      <div className="mb-8">

  <h1 className="text-4xl font-bold text-foreground">
    Messages
  </h1>

  <p className="text-muted-foreground mt-1">
    Connect with your customers
  </p>

</div>

      {chats.length === 0 ? (

        <div className="
  bg-card/80
  backdrop-blur-sm
  rounded-3xl
  shadow-lg
  p-10
  text-center
">

  <div className="text-6xl mb-4">
    💬
  </div>

  <h3 className="text-xl font-semibold text-foreground">
    No Messages Yet
  </h3>

  <p className="text-muted-foreground mt-2">
    Customer conversations will appear here.
  </p>

</div>

      ) : (

        <div className="space-y-4">

          {chats.map(
  (chat: any) => (

    <div
      key={chat.id}
      onClick={() =>
        navigate(
          `/creator-chat/${chat.id}`
        )
      }
className="
bg-card/80
backdrop-blur-sm
p-5
rounded-3xl
shadow-md
border border-white/50
cursor-pointer
hover:shadow-lg
transition-all
"    >

      <div className="flex items-center gap-3">

        <img
          src={
            chat.customer
              ?.profileImage ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              chat.customer?.name ||
              "Customer"
            )}`
          }
          alt=""
className="
w-14
h-14
rounded-full
object-cover
border-2
border-primary
shadow-sm
"        />

        <div>

<h3 className="font-semibold text-lg text-foreground">
            {
              chat.customer?.name ||
              "Customer"
            }

          </h3>

          <p className="text-sm text-muted-foreground">

            {
              chat.customer?.email
            }

          </p>

          <p className="
text-muted-foreground
text-sm
mt-1
line-clamp-1
">

            {chat.lastMessage}

          </p>

        </div>

      </div>

    </div>

  )
)}
        </div>

      )}

    </div>
  );
}