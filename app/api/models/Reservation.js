import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema({
  name: String,
  phone: String,
  people: Number,
  type: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Reservation || mongoose.model("Reservation", ReservationSchema);
