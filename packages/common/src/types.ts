import z from "zod";

export const SignupSchema = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string(),
});
export const loginSchema = z.object({
  email: z.string(),
  password: z.string(),

});
export const CreateRoomSchema =z.object({
    name:z.string().min(3).max(50)
})

