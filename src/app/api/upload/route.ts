import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Initialize Cloudinary with CLOUDINARY_URL or individual credentials
function initCloudinary(): boolean {
  const cloudinaryUrl = (process.env.CLOUDINARY_URL || "").trim();
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  let apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  let apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if ((!cloudName || !apiKey || !apiSecret) && cloudinaryUrl) {
    try {
      const uri = new URL(cloudinaryUrl);
      cloudName = cloudName || uri.host;
      apiKey = apiKey || uri.username;
      apiSecret = apiSecret || uri.password;
    } catch (err) {
      console.error("Failed to parse CLOUDINARY_URL:", err);
    }
  }

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const isConfigured = initCloudinary();
    if (!isConfigured) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cloudinary credentials missing or unparsed. Please check CLOUDINARY_URL in .env or provide an image URL directly.",
        },
        { status: 500 }
      );
    }

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
          timeout: 15000,
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
    const rawMessage = error instanceof Error ? error.message : "Error uploading image to Cloudinary.";
    const isDnsError =
      rawMessage.includes("ENOTFOUND") ||
      rawMessage.includes("ETIMEDOUT") ||
      rawMessage.includes("fetch failed");

    const message = isDnsError
      ? "DNS lookup failed for api.cloudinary.com (ENOTFOUND). Your network or ISP could not reach Cloudinary servers. You can use a direct image URL or choose an artisan preset photo instead."
      : rawMessage;

    console.error("Cloudinary upload error:", rawMessage);
    return NextResponse.json(
      { success: false, message, isDnsError },
      { status: 500 }
    );
  }
}
