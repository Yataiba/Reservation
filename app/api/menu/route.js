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
  
      console.log("Fetched Menus from DB:", allMenus); // Debugging log
  
      if (!Array.isArray(allMenus) || allMenus.length === 0) {
        return new Response(JSON.stringify([]), { status: 200 }); // ✅ Return an empty array instead of an error
      }
  
      // ✅ Ensure dates are formatted correctly
      const formattedMenus = allMenus.map((menu) => ({
        ...menu,
        date: new Date(menu.date).toISOString().split("T")[0], // Ensure date format is YYYY-MM-DD
      }));
  
      // If a specific day is requested
      if (queryDay) {
        const menuForDay = formattedMenus.find((m) => m.day === parseInt(queryDay));
        return new Response(JSON.stringify(menuForDay ? [menuForDay] : []), { status: 200 }); // ✅ Ensure array response
      }
  
      return new Response(JSON.stringify(formattedMenus), { status: 200 }); // ✅ Always return an array
    } catch (error) {
      console.error("Error fetching menu:", error);
      return new Response(JSON.stringify([]), { status: 500 }); // ✅ Always return an array, even on error
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
