import { RoomCanvas } from "@/components/RoomCanvas"
import { cookies } from "next/headers";

async function gettoken(){
    const token=(await cookies()).get('token')?.value
    return token
}
export default async function canvasPage({params}:{params:{
    roomId:string
}}){


const roomId=(await params).roomId
const token=(await gettoken()) || ''
return (
    <div>
    <RoomCanvas roomId={roomId} token={token}/> 
    </div>
)}