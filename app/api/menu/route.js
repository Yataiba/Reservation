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

    // ✅ Determine the first day of Ramadan dynamically
    const sortedMenus = allMenus.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
    const firstMenuDate = new Date(sortedMenus[0].date); // First menu date = Day 1

    // ✅ Determine which menu to fetch based on current time
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour >= 19) {
      // If it's after 19:00, move to the **next day**
      now.setDate(now.getDate() + 1);
    }

    const targetDate = now.toISOString().split("T")[0]; // Format as YYYY-MM-DD

    // If a specific day is requested
    if (queryDay) {
      // Convert the requested day into an actual date based on the first Ramadan day
      const requestedDate = new Date(firstMenuDate);
      requestedDate.setDate(firstMenuDate.getDate() + parseInt(queryDay) - 1);

      // Fetch the menu for the requested date
      const menu = allMenus.find((m) => m.date === requestedDate.toISOString().split("T")[0]);

      if (!menu) {
        return new Response(JSON.stringify({ error: "Menu not found for this day" }), { status: 404 });
      }

      return new Response(JSON.stringify(menu), { status: 200 });
    }

    // Fetch the menu for the calculated **target date**
    const menuForToday = allMenus.find((m) => m.date === targetDate);

    if (!menuForToday) {
      return new Response(JSON.stringify({ error: "Menu not found for today" }), { status: 404 });
    }

    return new Response(JSON.stringify(menuForToday), { status: 200 });
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

    await db.collection("ramadan_menu").updateOne(
      { date: formattedDate },
      { $set: { date: formattedDate, menu } },
      { upsert: true }
    );

    return new Response(JSON.stringify({ message: "Menu updated successfully" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error updating menu", details: error.message }), { status: 500 });
  }
}
