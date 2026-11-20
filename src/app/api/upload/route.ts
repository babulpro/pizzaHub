import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Initialize Cloudinary with CLOUDINARY_URL from environment
if (process.env.CLOUDINARY_URL) {
  try {
    const uri = new URL(process.env.CLOUDINARY_URL);
    cloudinary.config({
      cloud_name: uri.host,
      api_key: uri.username,
      api_secret: uri.password,
      secure: true,
    });
  } catch (err) {
    console.error("Failed to parse CLOUDINARY_URL:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file was uploaded." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload stream to Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "pizzahub_menu",
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary upload failed."));
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error uploading image to Cloudinary.";
    console.error("Cloudinary upload error:", message);
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
