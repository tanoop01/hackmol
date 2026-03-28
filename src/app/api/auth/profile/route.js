import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

import db from "@/lib/db";
import User from "@/models/User";

async function getAuthUserFromRequest(request) {
  const token = request.cookies.get("token")?.value;

  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    return user || null;
  } catch (_error) {
    return null;
  }
}

export async function PATCH(request) {
  try {
    await db();

    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await request.json().catch(() => ({}));
    const nextCity = String(payload?.city || "").trim();
    const nextState = String(payload?.state || "").trim();

    if (!nextCity || !nextState) {
      return NextResponse.json(
        { success: false, message: "city and state are required" },
        { status: 400 }
      );
    }

    authUser.city = nextCity;
    authUser.state = nextState;
    await authUser.save();

    return NextResponse.json(
      {
        success: true,
        user: authUser,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
