'use client'

import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

const JoinRoom =({rooms}:{rooms:{id:number,slug:string,createdAt:string,adminId:string}[]})=>{
    const router=useRouter()
    return(
        <div>
            {rooms.map((room,index)=>{
                return (
                    <div className="flex flex-row gap-5 items-center" key={index}>
                        <span>{room.id}</span>
                        <span>{room.slug}</span>
                        <Button onClick={()=>router.push(`/canvas/${room.id}`)} >Join Room</Button>
                    </div>
                )
            })}

        </div>
    )

}
export {JoinRoom}