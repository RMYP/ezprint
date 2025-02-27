"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { tryLogin } from "@/app/(frontend)/action/action";
import { setCookie } from "cookies-next";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useLogin } from "@/hooks/user-store";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
    const isLogin = useLogin((state) => state.loginStatus);
    const checkToken = useLogin((state) => state.setToken);
    const router = useRouter();

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
        setError("");

        if (isLogin) {
            router.push("/home");
        }
    }, [error, isLogin]);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (value: z.infer<typeof loginSchema>) => {
        try {
            setIsLoading(true);
            const data = await tryLogin(value);

            if (data.success === false) {
                setError(data.message);
                setIsLoading(false);
                return;
            }

            checkToken();
            setIsLoading(false);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Unexpected Error, please try again");
                console.log(err);
            }
            setIsLoading(false);
        }
    };

    const onSubmitGoogle = async () => {
        setIsLoadingGoogle(true);
        router.push("/api/v1/auth/google");
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <div className="flex flex-col gap-6">
                        <Form {...form}>
                            <form
                                className="px-6 md:px-8 flex flex-col gap-6"
                                onSubmit={form.handleSubmit(onSubmit)}
                            >
                                <div className="flex flex-col items-center text-center pt-6 md:pt-8">
                                    <h1 className="text-2xl font-bold">
                                        Welcome back
                                    </h1>
                                    <p className="text-balance text-muted-foreground">
                                        Login to your Acme Inc account
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="m@example.com"
                                                        {...field}
                                                        type="email"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        placeholder="********"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {isLoading ? (
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled
                                    >
                                        <Loader2 className="animate-spin" />
                                        Please wait
                                    </Button>
                                ) : (
                                    <Button type="submit" className="w-full">
                                        Login
                                    </Button>
                                )}
                            </form>
                        </Form>
                        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                            <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 px-6 md:px-8">
                            {isLoadingGoogle ? (
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled
                                >
                                    <Loader2 className="animate-spin" />
                                    Please wait
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full flex flex-row align-center"
                                    onClick={() => onSubmitGoogle()}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    <span className="text-md">
                                        Sign in with Google
                                    </span>
                                </Button>
                            )}
                        </div>
                        <div className="text-center text-sm pb-6 md:pb-8">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="underline underline-offset-4"
                            >
                                Sign up
                            </Link>
                        </div>
                    </div>
                    <div className="relative hidden bg-muted md:block">
                        import Image from "next/image";
                        <Image
                            src="/login.jpg"
                            alt="Image"
                            fill
                            className="absolute inset-0 object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                By clicking continue, you agree to our{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
            </div>
        </div>
    );
}
