import dbConnect from "../dbConnect";
import mongoose from "mongoose";

export const runtime = "nodejs"; // Ensure server environment

export async function GET(req) {
  try {
    await dbConnect();
    const db = mongoose.connection.db;
    
    const url = new URL(req.url);
    const queryDay = url.searchParams.get("day"); // Requested day (if provided)

    // Fetch all menu entries
    const allMenus = await db.collection("ramadan_menu").find().toArray();

    if (!allMenus.length) {
      return new Response(JSON.stringify({ error: "No menu data available" }), { status: 404 });
    }

    // ✅ Always fetch the menu for the next calendar day dynamically
    const today = new Date();
    today.setDate(today.getDate() + 1); // Move to the next day
    const targetDate = today.toISOString().split("T")[0];

    console.log(`Fetching menu for: ${targetDate}`);

    // Fetch the menu for the next day
    const menuForNextDay = allMenus.find((m) => m.date === targetDate);

    if (!menuForNextDay) {
      return new Response(JSON.stringify({ error: "Menu not found for next day" }), { status: 404 });
    }

    return new Response(JSON.stringify(menuForNextDay), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error fetching menu", details: error.message }), { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const db = mongoose.connection.db;

    const { day, date, menu } = await req.json();

    if (!date || !menu) {
      return new Response(JSON.stringify({ error: "Date and menu are required" }), { status: 400 });
    }

    // Ensure `date` is stored in YYYY-MM-DD format
    const formattedDate = new Date(date).toISOString().split("T")[0];

    let assignedDay = day; // Use provided day if exists

    if (!assignedDay) {
      // Fetch the latest day from the database
      const latestMenu = await db.collection("ramadan_menu")
        .find()
        .sort({ day: -1 }) // Sort by latest day
        .limit(1)
        .toArray();

      if (latestMenu.length > 0) {
        assignedDay = latestMenu[0].day + 1; // ✅ Increment latest day correctly
      } else {
        assignedDay = 1; // Start from Day 1 if no entries exist
      }
    }

    await db.collection("ramadan_menu").updateOne(
      { date: formattedDate },
      { $set: { date: formattedDate, menu, day: assignedDay } },
      { upsert: true }
    );

    return new Response(JSON.stringify({ message: "Menu updated successfully", assignedDay }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error updating menu", details: error.message }), { status: 500 });
  }
}
