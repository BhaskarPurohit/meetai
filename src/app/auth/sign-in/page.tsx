import { Card } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { SignInview } from "@/modules/auth/ui/views/sign-in-view"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const Page = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if(!!session){
        redirect("/auth")
    }

    return (
        <SignInview/>
    )
}

export default Page