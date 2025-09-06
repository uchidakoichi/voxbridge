"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Phone, PhoneOff, Send, Volume2, VolumeX, AlertCircle } from "lucide-react"

type CallStatus = "idle" | "dialing" | "connecting" | "in-call" | "ended"
type Speaker = "local" | "remote"

interface Message {
  id: string
  speaker: Speaker
  text: string
  translation?: string
  timestamp: Date
}

const REMOTE_RESPONSES = [
  "はい、こんにちは。お電話ありがとうございます。",
  "承知いたしました。",
  "申し訳ございませんが、もう一度お聞かせください。",
  "はい、わかりました。",
  "ありがとうございます。",
  "少々お待ちください。",
  "はい、そうですね。",
  "お忙しい中、ありがとうございます。",
]

export default function AccessiblePhoneApp() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [callStatus, setCallStatus] = useState<CallStatus>("idle")
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [translateEnabled, setTranslateEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const remoteResponseTimer = useRef<NodeJS.Timeout | null>(null)

  const generateTranslation = (text: string): string => {
    const translations: { [key: string]: string } = {
      "はい、こんにちは。お電話ありがとうございます。": "Hello, thank you for calling.",
      "承知いたしました。": "I understand.",
      "申し訳ございませんが、もう一度お聞かせください。": "I'm sorry, could you please repeat that?",
      "はい、わかりました。": "Yes, I understand.",
      "ありがとうございます。": "Thank you.",
      "少々お待ちください。": "Please wait a moment.",
      "はい、そうですね。": "Yes, that's right.",
      "お忙しい中、ありがとうございます。": "Thank you for your time despite being busy.",
    }
    return translations[text] || "Translation not available"
  }

  const addMessage = (speaker: Speaker, text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      speaker,
      text,
      translation: translateEnabled && speaker === "remote" ? generateTranslation(text) : undefined,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const startCall = async () => {
    if (!phoneNumber.trim()) {
      setError("電話番号を入力してください")
      return
    }

    setError(null)
    setIsLoading(true)
    setCallStatus("dialing")

    // Simulate dialing process
    setTimeout(() => {
      setCallStatus("connecting")

      // Simulate connection and automatic greeting
      setTimeout(() => {
        setCallStatus("in-call")
        setIsLoading(false)

        // Add automatic greeting message
        addMessage("local", "私は聴覚障害者なのでアプリで音声に変換してお話しします。よろしくお願いします。")

        // Simulate remote response after greeting
        setTimeout(() => {
          const randomResponse = REMOTE_RESPONSES[Math.floor(Math.random() * REMOTE_RESPONSES.length)]
          addMessage("remote", randomResponse)
        }, 2000)
      }, 2000)
    }, 1500)
  }

  const endCall = () => {
    setCallStatus("ended")
    setIsLoading(false)
    if (remoteResponseTimer.current) {
      clearTimeout(remoteResponseTimer.current)
    }

    // Reset after 2 seconds
    setTimeout(() => {
      setCallStatus("idle")
      setMessages([])
      setPhoneNumber("")
    }, 2000)
  }

  const handleSpeak = () => {
    if (!inputText.trim()) {
      setError("送信するテキストを入力してください")
      return
    }

    if (callStatus !== "in-call") {
      setError("通話中のみメッセージを送信できます")
      return
    }

    setError(null)
    addMessage("local", inputText)
    setInputText("")

    remoteResponseTimer.current = setTimeout(
      () => {
        const randomResponse = REMOTE_RESPONSES[Math.floor(Math.random() * REMOTE_RESPONSES.length)]
        addMessage("remote", randomResponse)
      },
      1500 + Math.random() * 2000,
    )
  }

  const getStatusInfo = () => {
    switch (callStatus) {
      case "idle":
        return { text: "待機中", color: "bg-muted", icon: Phone }
      case "dialing":
        return { text: "発信中...", color: "bg-yellow-500", icon: Phone }
      case "connecting":
        return { text: "接続中...", color: "bg-blue-500", icon: Phone }
      case "in-call":
        return { text: "通話中", color: "bg-green-500", icon: Volume2 }
      case "ended":
        return { text: "通話終了", color: "bg-gray-500", icon: PhoneOff }
      default:
        return { text: "不明", color: "bg-muted", icon: AlertCircle }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground text-balance">聴覚障害者向け電話アプリ</h1>
          <p className="text-lg text-muted-foreground text-pretty">テキスト入力で音声通話を可能にします</p>
          <div className="flex items-center justify-center gap-3">
            <div className={`w-4 h-4 rounded-full ${statusInfo.color}`} />
            <StatusIcon className="w-5 h-5 text-muted-foreground" />
            <span className="text-lg font-medium text-foreground">{statusInfo.text}</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-destructive font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">通話開始</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {callStatus === "idle" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone" className="text-base font-medium">
                    電話番号
                  </Label>
                  <Input
                    id="phone"
                    placeholder="例: 03-1234-5678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="text-lg h-12 mt-2"
                    onKeyDown={(e) => e.key === "Enter" && startCall()}
                  />
                </div>
                <Button
                  onClick={startCall}
                  size="lg"
                  className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  <Phone className="w-6 h-6 mr-3" />
                  {isLoading ? "発信中..." : "通話開始"}
                </Button>
              </div>
            )}

            {callStatus !== "idle" && callStatus !== "ended" && (
              <div className="text-center">
                <Button onClick={endCall} size="lg" variant="destructive" className="h-14 text-lg px-8">
                  <PhoneOff className="w-6 h-6 mr-3" />
                  通話終了
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {callStatus === "in-call" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">メッセージ送信</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="相手に伝えたいことを入力してください..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSpeak()}
                  className="text-lg h-12"
                />
                <Button
                  onClick={handleSpeak}
                  disabled={!inputText.trim()}
                  className="h-12 px-6 bg-secondary hover:bg-secondary/90"
                >
                  <Send className="w-5 h-5 mr-2" />
                  送信
                </Button>
              </div>

              <div className="flex items-center space-x-3">
                <Switch id="translate" checked={translateEnabled} onCheckedChange={setTranslateEnabled} />
                <Label htmlFor="translate" className="text-base">
                  翻訳を表示
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">会話履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <VolumeX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">通話中の会話がここに表示されます</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={message.speaker === "local" ? "default" : "secondary"}
                        className={`text-sm px-3 py-1 ${
                          message.speaker === "local"
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent text-accent-foreground"
                        }`}
                      >
                        {message.speaker === "local" ? "あなた" : "相手"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {message.timestamp.toLocaleTimeString("ja-JP")}
                      </span>
                    </div>
                    <p className="text-foreground text-lg leading-relaxed pl-2 border-l-2 border-border">
                      {message.text}
                    </p>
                    {message.translation && (
                      <p className="text-accent text-base italic leading-relaxed pl-2 border-l-2 border-accent/30">
                        翻訳: {message.translation}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
