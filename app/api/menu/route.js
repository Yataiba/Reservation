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
        return new Response(JSON.stringify([]), { status: 200 }); // Return empty array instead of an error
      }
  
      // If a specific day is requested, return it as an array to match frontend expectations
      if (queryDay) {
        const menu = allMenus.find((m) => m.day === parseInt(queryDay));
  
        if (!menu) {
          return new Response(JSON.stringify([]), { status: 200 }); // Return empty array if no menu found
        }
  
        return new Response(JSON.stringify([menu]), { status: 200 }); // Return as array
      }
  
      return new Response(JSON.stringify(allMenus), { status: 200 });
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
        assignedDay = latestMenu[0].day + 1; // Increment latest day
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
