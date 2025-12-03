import { axiosServer } from "@/lib/axiosServer";

export async function GET(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  const api = axiosServer();
  const roomId= (await params).roomId
  console.log(roomId)

  try {
    const result = await api.get(`/chats/${roomId}`);
    return Response.json(result.data);
  } catch (err: any) {
    console.error("Backend error:", err.response?.data || err);
    return Response.json(
      { ok: false, error: "backend request failed" },
      { status: 500 }
    );
  }
}
