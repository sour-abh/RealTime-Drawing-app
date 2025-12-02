import { RoomCanvas } from "@/components/RoomCanvas"

export default async function canvasPage({params}:{params:{
    roomId:string
}}){


const roomId=(await params).roomId
return (
    <div>
    <RoomCanvas roomId={roomId}/> 
    </div>
)}