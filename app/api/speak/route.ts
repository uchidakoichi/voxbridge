import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
const subtitles: Array<{
  id: string
  speaker: "local" | "remote"
  text: string
  translation?: string
  timestamp: string
}> = []

const generateTranslation = (text: string): string => {
  const translations: { [key: string]: string } = {
    "私は聴覚障害者なのでアプリで音声に変換してお話しします。よろしくお願いします。":
      "I am hearing impaired, so I will speak through this app that converts to voice. Please bear with me.",
    こんにちは: "Hello",
    ありがとうございます: "Thank you",
    申し訳ございません: "I'm sorry",
    "はい、わかりました": "Yes, I understand",
    もう一度お聞かせください: "Could you please repeat that?",
    お忙しい中ありがとうございます: "Thank you for your time despite being busy",
    よろしくお願いします: "Please treat me favorably",
    失礼いたします: "Excuse me / Goodbye",
    お疲れさまでした: "Thank you for your hard work",
  }

  // Try exact match first, then fallback to generic translation
  return translations[text] || `Translation: ${text} (English equivalent)`
}

export async function POST(request: NextRequest) {
  try {
    const { text, translate } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    console.log("[v0] Processing Japanese speech:", text)

    // Add local speaker subtitle
    const newSubtitle = {
      id: `subtitle_${Date.now()}`,
      speaker: "local" as const,
      text,
      translation: translate ? generateTranslation(text) : undefined,
      timestamp: new Date().toISOString(),
    }

    subtitles.push(newSubtitle)

    setTimeout(
      () => {
        const remoteResponses = [
          "はい、こんにちは。お電話ありがとうございます。",
          "承知いたしました。",
          "申し訳ございませんが、もう一度お聞かせください。",
          "はい、わかりました。",
          "ありがとうございます。",
          "少々お待ちください。",
          "はい、そうですね。",
          "お忙しい中、ありがとうございます。",
          "かしこまりました。",
          "恐れ入ります。",
        ]

        const remoteText = remoteResponses[Math.floor(Math.random() * remoteResponses.length)]
        const remoteSubtitle = {
          id: `subtitle_${Date.now()}_remote`,
          speaker: "remote" as const,
          text: remoteText,
          translation: translate ? generateTranslation(remoteText) : undefined,
          timestamp: new Date().toISOString(),
        }

        subtitles.push(remoteSubtitle)
      },
      1500 + Math.random() * 1500,
    ) // Random delay between 1.5-3 seconds

    return NextResponse.json({
      success: true,
      message: "Speech processed successfully",
      subtitle: newSubtitle,
    })
  } catch (error) {
    console.error("[v0] Speak API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export { subtitles }
