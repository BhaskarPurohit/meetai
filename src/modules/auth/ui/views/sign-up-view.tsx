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
import { FaGithub, FaGoogle} from "react-icons/fa"

const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required!" }),
    email: z.string().email(),
    password: z.string().min(1, { message: "Password is required" }),
    confirmPassword: z.string().min(1, { message: "Password is required" })
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    })

export const SignUpView = () => {

    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [pending, setPending] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setError(null)
        setPending(true)

        authClient.signUp.email(
            {
                name: data.name,
                email: data.email,
                password: data.password,
                callbackURL:'/'
            },

            {
                onSuccess: () => {
                    setPending(false)
                    router.push("/")
                    
                },
                 onError:({error}: {error: {message: string}})=>{
                        setPending(false)
                        setError(error.message)
                 }
                                          
            }
        )
    }

    const onSocial = async ( provider: "github" | "google") =>{
            setError(null)
            setPending(true)
    
            authClient.signIn.social(
                {
                    provider:provider
                },
    
                {
                    onSuccess: ()=>{
                        router.push("/")
                        setPending(false)
                    },
                    onError: ({error}) =>{
                        setPending(false)
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
                                        Let&apos;s get started
                                    </h1>
                                    <p className="text-muted-foreground text-balance">
                                        Create your account
                                    </p>
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="John Doe"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}>

                                    </FormField>
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
                                                        type="password"
                                                        placeholder="Choose a Strong Password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}>

                                    </FormField>


                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="********"
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
                                    Sign Up
                                </Button>
                                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                                        Or Continue with
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        disabled={pending}
                                        onClick={() => onSocial("google")
                                        }
                                        variant="outline"
                                        type="button"
                                        className="w-full">
                                        <FaGoogle/>

                                    </Button>
                                    <Button
                                        disabled={pending}
                                        onClick={() => onSocial("github")}
                                        variant="outline"
                                        type="button"
                                        className="w-full">
                                        <FaGithub/>

                                    </Button>
                                </div>
                                <div className="text-center text-sm">
                                    Already have an account ?{" "}
                                    <Link href="/auth/sign-in" className="underline underline-offset-4">
                                        Sign In</Link>
                                </div>
                            </div>

                        </form>

                        <div className="relative md:flex items-center justify-center bg-gradient-to-br  from-[#4F8CFF] via-[#7B5CFF]  to-[#1E1B4B]">
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