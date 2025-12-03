'use client'
import { Button } from "./ui/button";
import axios from "axios";

     function handleCreateRoom(){
    try {
    const res=axios.post('/create-room').catch((err: any) => {
    console.error("Backend error:", err);
  });
  } catch (err: any) {
    console.error("Backend error:", err);
  }
    }
    

async function CreateRoom(){


    return(
        <div>
            <Button onClick={()=>handleCreateRoom()}>Create New Room </Button>
        </div>
    )
	

}

export{CreateRoom}