import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

import db from "@/lib/db";
import Grievance from "@/models/Grievance";
import Petition from "@/models/Petition";
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

export async function GET(_request, { params }) {
  try {
    await db();
    const { id } = await Promise.resolve(params);

    const petition = await Petition.findById(id).populate({ path: "issueId", select: "title" });

    if (!petition) {
      return NextResponse.json(
        { success: false, message: "Petition not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, petition }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch petition" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await db();
    const { id } = await Promise.resolve(params);

    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const petition = await Petition.findById(id);
    if (!petition) {
      return NextResponse.json(
        { success: false, message: "Petition not found" },
        { status: 404 }
      );
    }

    if (String(petition.createdBy) !== String(authUser._id)) {
      return NextResponse.json(
        { success: false, message: "Only the petition creator can update petition status" },
        { status: 403 }
      );
    }

    const payload = await request.json().catch(() => ({}));
    const action = String(payload?.action || "").trim().toLowerCase();
    const nextStatus = String(payload?.status || "").trim().toLowerCase();
    const shouldDeclareVictory = action === "declare_victory" || nextStatus === "victory_declared";

    if (!shouldDeclareVictory) {
      return NextResponse.json(
        { success: false, message: "Unsupported action" },
        { status: 400 }
      );
    }

    petition.status = "victory_declared";
    petition.victoryDeclaredAt = new Date();
    await petition.save();

    const updated = await Petition.findById(id).populate({ path: "issueId", select: "title" });

    return NextResponse.json(
      { success: true, petition: updated },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update petition" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await db();
    const { id } = await Promise.resolve(params);

    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const petition = await Petition.findById(id);
    if (!petition) {
      return NextResponse.json(
        { success: false, message: "Petition not found" },
        { status: 404 }
      );
    }

    if (String(petition.createdBy) !== String(authUser._id)) {
      return NextResponse.json(
        { success: false, message: "Only the petition creator can delete this petition" },
        { status: 403 }
      );
    }

    if (petition.issueId) {
      await Grievance.findOneAndUpdate(
        { _id: petition.issueId, petitionId: petition._id },
        { $set: { petitionId: null } }
      );
    }

    await Petition.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Petition deleted" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete petition" },
      { status: 500 }
    );
  }
}
