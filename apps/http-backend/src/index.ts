import express from 'express'
import {userRouter} from '../src/user'

const app=express()
app.use(express.json())
app.use('/app/v1/user',userRouter)

app.listen(3001)