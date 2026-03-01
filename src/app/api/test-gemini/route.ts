import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "test:gemini",
      limit: 10,
      window: "1 h",
    });
    if (rateLimit) return rateLimit;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_KEY is not set in .env file",
        instructions: "Add GEMINI_API_KEY=your_key to .env and restart server"
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent("Say 'Hello World' in one sentence.");
    const text = result.response.text();

    return NextResponse.json({
      success: true,
      message: "Gemini API is working!",
      test_response: text,
      api_key_configured: true
    });

  } catch (error) {
    console.error("Gemini test failed:", error);

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      success: false,
      error: message,
      instructions: "Check your GEMINI_API_KEY in .env file"
    }, { status: 500 });
  }
}
