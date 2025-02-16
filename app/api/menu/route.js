import dbConnect from "../dbConnect";
import mongoose from "mongoose";

export const runtime = "nodejs"; // Ensure server environment

export async function GET(req) {
  try {
    await dbConnect();
    const db = mongoose.connection.db;
    
    const url = new URL(req.url);
    const queryDay = url.searchParams.get("day");
    const queryDate = url.searchParams.get("date");

    // Fetch all menu entries
    const allMenus = await db.collection("ramadan_menu").find().toArray();

    if (!allMenus.length) {
      return new Response(JSON.stringify({ error: "No menu data available" }), { status: 404 });
    }

    // Ensure menus are sorted by date
    const sortedMenus = allMenus.sort((a, b) => new Date(a.date) - new Date(b.date));

    // If requesting by a specific day number
    if (queryDay) {
      const menu = allMenus.find((m) => m.day === parseInt(queryDay));
      if (!menu) {
        return new Response(JSON.stringify({ error: "Menu not found for this day" }), { status: 404 });
      }
      return new Response(JSON.stringify(menu), { status: 200 });
    }

    // If requesting by date (used by pre-reservation system)
    if (queryDate) {
      const menu = allMenus.find((m) => m.date === queryDate);
      if (!menu) {
        return new Response(JSON.stringify({ error: "Menu not found for this date" }), { status: 404 });
      }
      return new Response(JSON.stringify(menu), { status: 200 });
    }

    // Return all menus (for admin & reservations filtering)
    return new Response(JSON.stringify(sortedMenus), { status: 200 });
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
