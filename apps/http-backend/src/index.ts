import express from 'express'
import {userRouter} from './user'
import cookieParser from "cookie-parser";

const app=express()
app.use(express.json())
app.use(cookieParser())
app.use('/app/v1/user',userRouter)

app.listen(3001)