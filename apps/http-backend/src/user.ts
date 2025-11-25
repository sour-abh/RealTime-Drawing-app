import express, { NextFunction, Request, Response, Router } from 'express'

import {SignupSchema,loginSchema} from '@repo/common/types'

const userRouter:Router=express.Router()


const authmiddleware=async(req:Request,res:Response,next:NextFunction)=>{

    

}

userRouter.post('/signup',function async(req:Request,res:Response){


    const username=req.body.username;
    const password=req.body.password;
    const firstname=req.body.firstname;
    const lastname=req.body.lastname;

    // const SignupSchema=z.object({
    //     username:z.string().max(50),
    //     password:z.string().min(8),
    //     firstname:z.string().min(3).max(50),
    //     lastname:z.string().max(50),

    // })
    const parsedbody=SignupSchema.safeParse(req.body)
    if(!parsedbody.success){
        res.status(403).json({ message: "input validation error" });
        return 
    }
// bcrypt hashing
//  db.create



})
userRouter.post('/login',function async(req:Request,res:Response){
    const loginParsed=loginSchema.safeParse(req.body)
    if(!loginParsed.success){
        res.status(403).json({ message: "input validation error" });
        return
    }
    //jwt .sign
    //res jwt
})
userRouter.post('/create-room',authmiddleware,function async(req:Request,res:Response){
    // if loged in 
    // can create a room with specific id 
})

export {userRouter}