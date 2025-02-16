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

    // ✅ Sort menus by date to determine the first day dynamically
    const sortedMenus = allMenus.sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstMenuDate = new Date(sortedMenus[0].date); // First menu date = Day 1

    // ✅ Ensure each menu entry has a `day` field based on its position
    const menusWithDays = sortedMenus.map((menu, index) => ({
      day: index + 1, // Day 1 is the first menu entry
      date: menu.date,
      menu: menu.menu,
    }));

    // ✅ Handle fetching a specific day if requested
    if (queryDay) {
      const requestedMenu = menusWithDays.find((m) => m.day === parseInt(queryDay));
      if (!requestedMenu) {
        return new Response(JSON.stringify({ error: "Menu not found for this day" }), { status: 404 });
      }
      return new Response(JSON.stringify(requestedMenu), { status: 200 });
    }

    // ✅ Return all menus with day numbers included
    return new Response(JSON.stringify(menusWithDays), { status: 200 });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error fetching menu", details: error.message }),
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const db = mongoose.connection.db;

    const { date, menu } = await req.json();

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
    return new Response(
      JSON.stringify({ error: "Error updating menu", details: error.message }),
      { status: 500 }
    );
  }
}
