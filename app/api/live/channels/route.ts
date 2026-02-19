import { NextResponse } from "next/server"
import { getLiveChannelsMerged } from "@/lib/live-sources"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const channels = await getLiveChannelsMerged()
    return NextResponse.json({ channels, count: channels.length })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load channels" }, { status: 500 })
  }
}