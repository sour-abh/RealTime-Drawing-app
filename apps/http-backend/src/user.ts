import express, { NextFunction, Request, Response, Router } from 'express'
import bcrypt from 'bcrypt'
import z from 'zod';
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

const userRouter:Router=express.Router()


const authmiddleware=async(req:Request,res:Response,next:NextFunction)=>{

    

}

userRouter.post('/signup',function async(req:Request,res:Response){


    const username=req.body.username;
    const password=req.body.password;
    const firstname=req.body.firstname;
    const lastname=req.body.lastname;

    const SignupSchema=z.object({
        username:z.string().max(50),
        password:z.string().min(8),
        firstname:z.string().min(3).max(50),
        lastname:z.string().max(50),

    })
    const parsedbody=z.safeParse(SignupSchema,req.body)
    if(!parsedbody.success){
        return res.status(403).json({message:'input validation error'})
    }
    

// zod validation
// bcrypt hashing
//  db.create



})
userRouter.post('/login',function async(req:Request,res:Response){
    //jwt .sign
    //res jwt
})
userRouter.post('/create-room',authmiddleware,function async(req:Request,res:Response){
    // if loged in 
    // can create a room with specific id 
})

export {userRouter}