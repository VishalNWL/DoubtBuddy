import { Discussion } from "../Models/Discussion.model.js";

const makeRoomId = (school, classNum, batch) => `${school}|${classNum}${batch}`;

export default function registerDiscussionHandlers(io, socket) {
  const actor = socket.user || socket.school;

  if (!actor) {
    console.error("❌ No authenticated user on socket");
    return;
  }

  const { school, class: actorClass, batch: actorBatch, username, _id: userId } = actor;

  // ✅ Join initial room
  socket.join(makeRoomId(school, actorClass, actorBatch));

  // ✅ Allow switching rooms
  socket.on("join_room", ({ classNum: c, batch: b }) => {
    const rid = makeRoomId(school, c, b);
    socket.join(rid);
  });

  // ✅ Handle sending messages
  socket.on("send_message", async (payload, ack) => {
    try {
      const text = (payload?.text || "").trim();
      if (!text) throw new Error("Message cannot be empty");
      if (text.length > 2000) throw new Error("Message too long");

      // ✅ Use payload.class & payload.batch if provided
      const targetClass = payload.class || actorClass;
      const targetBatch = payload.batch || actorBatch;

      const doc = await Discussion.create({
        text,
        sender: userId,
        senderName: username,
        school,
        class: targetClass,
        batch: targetBatch,
      });

      const message = {
        _id: doc._id.toString(),
        text: doc.text,
        sender: doc.sender.toString(),
        senderName: doc.senderName,
        school: doc.school,
        class: doc.class,
        batch: doc.batch,
        createdAt: doc.createdAt.toISOString(),
      };

      // ✅ Emit only to the correct room
      const rid = makeRoomId(doc.school, doc.class, doc.batch);
      io.to(rid).emit("receive_message", message);

      if (ack) ack({ ok: true, message });
    } catch (err) {
      if (ack) ack({ ok: false, error: err.message });
    }
  });

  // ✅ Optional typing indicator
  socket.on("typing", ({ classNum: c, batch: b }) => {
    const rid = makeRoomId(school, c || actorClass, b || actorBatch);
    socket.to(rid).emit("peer_typing", { username });
  });

  socket.on("disconnect", () => {
    console.log(`🔌 ${username} disconnected`);
  });
}
