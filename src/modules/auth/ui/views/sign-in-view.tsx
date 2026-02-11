"use client"

import { Card, CardContent } from "@/components/ui/card"
import { z } from "zod"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { OctagonAlertIcon } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState } from "react"

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, { message: "Password is required" })
})

export const SignInview = () => {

    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [pending, setPending] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onSubmit = async ( data: z.infer<typeof formSchema>) =>{
        setError(null)
        setPending(true)

        authClient.signIn.email(
            {
                email: data.email,
                password: data.password
            },

            {
                onSuccess: ()=>{
                    router.push("/")
                    setPending(false)
                },
                onError: ({error}) =>{
                    setError(error.message )
                }
            }
        )
    }

    

    return (
        <div className="flex flex-col gap-6">
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p- md:p-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col items-center text-center">
                                    <h1 className="text-xl font-bold">
                                        Welcome Back
                                    </h1>
                                    <p className="text-muted-foreground text-balance">
                                        Login to your Account
                                    </p>
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="abc@example.com"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}>

                                    </FormField>

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="type"
                                                        placeholder="Choose a Strong Password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}>

                                    </FormField>


                                </div>
                                {!!error && (
                                    <Alert className="bg-destructive/10 border-none">
                                        <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                                        <AlertTitle>Error</AlertTitle>
                                    </Alert>
                                )}
                                <Button
                                    type="submit"
                                    className="w-full ">
                                    Sign In
                                </Button>
                                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                                        Or Continue with
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        className="w-full">
                                        Google

                                    </Button>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        className="w-full">
                                        Github

                                    </Button>
                                </div>
                                <div className="text-center text-sm">
                                    Don&apos;t have an account ?{" "}
                                    <Link href="/auth/sign-up" className="underline underline-offset-4">
                                        Sign Up</Link>
                                </div>
                            </div>

                        </form>

                        <div className="
  relative md:flex items-center justify-center
  bg-gradient-to-br
  from-[#4F8CFF]
  via-[#7B5CFF]
  to-[#1E1B4B]
">
                            <div className="flex flex-col items-center gap-4">
                                <img
                                    src="/meetai_logo.svg"
                                    alt="Meet.ai logo"
                                    className="w-[180px] h-auto drop-shadow-xl"
                                />
                            </div>
                        </div>

                    </Form>
                </CardContent>

            </Card>

            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By Clicking continue, you agree to our <a href="#">Terms of Service</a> & <a href="">Privacy Policy</a>
            </div>
        </div>

    )
}