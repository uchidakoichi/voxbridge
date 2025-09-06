import { type NextRequest, NextResponse } from "next/server"

let currentCall: {
  id: string
  phoneNumber?: string
  status: "idle" | "dialing" | "connecting" | "in-call" | "ended"
  startTime?: Date
} = {
  id: "",
  status: "idle",
}

export async function POST(request: NextRequest) {
  try {
    const { action, phoneNumber } = await request.json()

    if (action === "start") {
      console.log("[v0] Starting voice call to:", phoneNumber)

      const callId = `call_${Date.now()}`
      currentCall = {
        id: callId,
        phoneNumber,
        status: "dialing",
        startTime: new Date(),
      }

      // Simulate call progression: dialing -> connecting -> in-call
      setTimeout(() => {
        currentCall.status = "connecting"
      }, 1000)

      setTimeout(() => {
        currentCall.status = "in-call"
      }, 3000)

      return NextResponse.json({
        success: true,
        message: "Call started successfully",
        callId,
        status: currentCall.status,
        phoneNumber,
      })
    } else if (action === "end") {
      console.log("[v0] Ending voice call:", currentCall.id)

      const endedCall = { ...currentCall }
      currentCall = {
        id: "",
        status: "idle",
      }

      return NextResponse.json({
        success: true,
        message: "Call ended successfully",
        callId: endedCall.id,
        duration: endedCall.startTime ? Date.now() - endedCall.startTime.getTime() : 0,
      })
    } else if (action === "status") {
      return NextResponse.json({
        success: true,
        call: currentCall,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Voice API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
