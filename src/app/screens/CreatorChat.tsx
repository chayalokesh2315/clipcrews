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
  Send,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import {
  auth,
  db,
} from "../../firebase";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

export default function CreatorChat() {

  const navigate = useNavigate();

  const { chatId } = useParams();

  const [messages,
    setMessages] =
    useState<any[]>([]);

  const [customer,
    setCustomer] =
    useState<any>(null);

  const [message,
    setMessage] =
    useState("");

  useEffect(() => {

    const fetchChat =
      async () => {

        if (!chatId)
          return;

        const chatDoc =
          await getDoc(
            doc(
              db,
              "chats",
              chatId
            )
          );

        if (
          chatDoc.exists()
        ) {

          const chatData =
            chatDoc.data();

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

            setCustomer(
              customerDoc.data()
            );
          }
        }
      };

    fetchChat();

  }, [chatId]);

  useEffect(() => {

    if (!chatId)
      return;

    const q =
      query(
        collection(
          db,
          "chats",
          chatId,
          "messages"
        ),
        orderBy(
          "createdAt",
          "asc"
        )
      );

    const unsubscribe =
      onSnapshot(
        q,
        (snapshot) => {

          const data =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );

          setMessages(data);
        }
      );

    return () =>
      unsubscribe();

  }, [chatId]);

  const sendMessage =
    async () => {

      if (
        !message.trim()
      )
        return;

      await addDoc(
  collection(
    db,
    "chats",
    chatId!,
    "messages"
  ),
  {
    text: message,

    senderId:
      auth.currentUser?.uid,

    receiverId:
      customer?.uid,

    customerId:
      customer?.uid,

    creatorId:
      auth.currentUser?.uid,

    createdAt:
      serverTimestamp(),
  }
);
await updateDoc(
  doc(
    db,
    "chats",
    chatId!
  ),
  {
    lastMessage:
      message,
    updatedAt:
      serverTimestamp(),
  }
);

      setMessage("");
    };

  return (
<div className="min-h-screen bg-gradient-to-br  via-white  flex flex-col">
      {/* HEADER */}
<div className="bg-primary text-primary-foreground text-white p-4 flex items-center gap-3 shadow-lg">
        <button
  onClick={() => navigate(-1)}
  className="p-2 rounded-full hover:bg-card/20 transition"
>
          <ArrowLeft />
        </button>
        <div className="flex items-center gap-3">
<div className="w-12 h-12 rounded-full overflow-hidden bg-card">

  {customer?.profileImage ? (

    <img
      src={customer.profileImage}
      alt=""
      className="w-full h-full object-cover"
    />

  ) : (

    <div className="w-full h-full flex items-center justify-center text-primary font-bold">
      {customer?.name?.charAt(0)}
    </div>

  )}
  <p className="text-white/80 text-sm">
  Customer
</p>

</div>
</div>
        <div>

          <h2 className="text-lg font-semibold">

            {customer?.name ||
              "Customer"}

          </h2>

        </div>

      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 && (

  <div className="text-center mt-20">

    <div className="text-6xl mb-4">
      💬
    </div>

    <h3 className="text-xl font-semibold text-foreground">
      Start Conversation
    </h3>

    <p className="text-muted-foreground mt-2">
      Reply to your customer here.
    </p>

  </div>

)}
        {messages.map(
          (msg: any) => {

            const isMine =
              msg.senderId ===
              auth.currentUser?.uid;

            return (

              <div
                key={msg.id}
                className={`flex ${
                  isMine
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`px-4 py-2 rounded-2xl max-w-[75%] ${
                    isMine
  ? "bg-primary text-primary-foreground text-white shadow-md"
  : "bg-card border border-border shadow-sm"
                  }`}
                >

                  {msg.text}

                </div>

              </div>

            );
          }
        )}

      </div>

      {/* INPUT */}
<div className="bg-card/90 backdrop-blur-md border-t p-4 flex gap-2">
        <Input
          value={message}
          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }
          placeholder="Type a reply..."
        />

        <Button
  onClick={sendMessage}
  className="
    bg-primary text-primary-foreground
    hover:
    hover:
    hover:
    text-white
  "
>

          <Send className="w-4 h-4" />

        </Button>

      </div>

    </div>
  );
}