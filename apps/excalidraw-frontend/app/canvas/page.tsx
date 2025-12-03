

import {CreateRoom} from "@/components/CreateRoom";
import { axiosServer } from "@/lib/axiosServer";
import { JoinRoom } from "@/components/JoinRoom";


async function getRooms(){
    const api=axiosServer()
    const res=await api.get('/rooms')
    return res.data.room
}
export default  async function page(){

    const rooms=await getRooms()

    return(
        <div className="bg-zinc-800 flex flex-col gap-10 items-center justify-center h-screen w-full max-w-7xl px-6 ">
            <div className="bg-zinc-700 rounded-sm shadow-2xl border-zinc-600 flex justify-center items-center max-w-xl p-5 w-full min-h-[200px]">
                <CreateRoom />
            </div>
            {/* joined room */}
            <div className="bg-zinc-700 p-5 max-w-xl min-h-[250px] w-full flex items-center rounded justify-center text-white">
                <JoinRoom rooms={rooms}/>
            </div>
            </div>
        
    )

}