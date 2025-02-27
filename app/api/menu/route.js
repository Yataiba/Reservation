import dbConnect from "../dbConnect";
import mongoose from "mongoose";


export const runtime = "nodejs"; // Ensure server environment

export async function GET(req) {
  try {
    await dbConnect();
    const db = mongoose.connection.db;

    const url = new URL(req.url);
    const day = url.searchParams.get("day");

    if (day) {
      // Fetch a specific day's menu
      const menu = await db.collection("ramadan_menu").findOne({ day: parseInt(day) });
      if (!menu) {
        return new Response(JSON.stringify({ error: "Menu not found for this day" }), { status: 404 });
      }
      return new Response(JSON.stringify(menu), { status: 200 });
    } else {
      // Fetch all menus if no specific day is requested
      const allMenus = await db.collection("ramadan_menu").find().toArray();
      return new Response(JSON.stringify(allMenus), { status: 200 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error fetching menu", details: error.message }), { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const db = mongoose.connection.db;

    const { day, date, menu } = await req.json();

    if (!day || !date || !menu) {
      return new Response(JSON.stringify({ error: "All fields (day, date, menu) are required" }), { status: 400 });
    }

    await db.collection("ramadan_menu").updateOne(
      { day: parseInt(day) },
      { $set: { date, menu } },
      { upsert: true }
    );

    return new Response(JSON.stringify({ message: "Menu updated successfully" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error updating menu", details: error.message }), { status: 500 });
  }
}
