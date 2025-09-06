import { NextResponse } from "next/server"
import { subtitles } from "../speak/route"

export async function GET() {
  try {
    console.log("[v0] Fetching subtitles, count:", subtitles.length)

    return NextResponse.json({
      success: true,
      subtitles: subtitles.map((subtitle) => ({
        ...subtitle,
        timestamp: new Date(subtitle.timestamp),
      })),
    })
  } catch (error) {
    console.error("[v0] Subtitles API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    subtitles.length = 0 // Clear the shared array
    console.log("[v0] Cleared all subtitles")

    return NextResponse.json({
      success: true,
      message: "Subtitles cleared",
    })
  } catch (error) {
    console.error("[v0] Clear subtitles API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
