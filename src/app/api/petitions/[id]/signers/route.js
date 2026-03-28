import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

import db from "@/lib/db";
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

export async function GET(request, { params }) {
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

    const petition = await Petition.findById(id).populate({
      path: "signerEntries.user",
      select: "name city state",
    });

    if (!petition) {
      return NextResponse.json(
        { success: false, message: "Petition not found" },
        { status: 404 }
      );
    }

    if (String(petition.createdBy) !== String(authUser._id)) {
      return NextResponse.json(
        { success: false, message: "Only petition creator can view signer list" },
        { status: 403 }
      );
    }

    let signerList = Array.isArray(petition.signerEntries)
      ? petition.signerEntries
          .map((entry) => {
            const signer = entry?.user;
            if (!signer) {
              return null;
            }

            return {
              id: String(signer?._id || ""),
              name: signer?.name || "Unknown",
              city: signer?.city || "N/A",
              state: signer?.state || "N/A",
              signedAt: entry?.signedAt || null,
            };
          })
          .filter(Boolean)
      : [];

    if (signerList.length === 0 && Array.isArray(petition.signatures) && petition.signatures.length > 0) {
      const populatedLegacy = await Petition.findById(id).populate({
        path: "signatures",
        select: "name city state",
      });

      signerList = Array.isArray(populatedLegacy?.signatures)
        ? populatedLegacy.signatures
            .map((signer) => {
              if (!signer) {
                return null;
              }

              return {
                id: String(signer?._id || ""),
                name: signer?.name || "Unknown",
                city: signer?.city || "N/A",
                state: signer?.state || "N/A",
                signedAt: populatedLegacy?.createdAt || null,
              };
            })
            .filter(Boolean)
        : [];
    }

    signerList.sort((a, b) => new Date(b.signedAt || 0).getTime() - new Date(a.signedAt || 0).getTime());

    return NextResponse.json(
      {
        success: true,
        signers: signerList,
        total: signerList.length,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch signer list" },
      { status: 500 }
    );
  }
}
