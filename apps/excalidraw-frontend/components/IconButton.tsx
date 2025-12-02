import { ReactNode } from "react";

export function IconButton({onClick,icon,activated}:{onClick:()=>void, icon:ReactNode,activated:boolean}){
    return(
    <div className={`rounded-full w-20 h-20 flex justify-center items-center bg-zinc-900 hover:bg-zinc-600 ${activated ? ` text-emerald-500`:` text-white`} text-lg font-bold`} onClick={onClick}>
        {icon}
    </div>)


}