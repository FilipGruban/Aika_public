import {z} from "zod";
import {Provider, Role} from "@prisma/client";


export const userSchema = z.object({
    id: z.string().cuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.nativeEnum(Role),
    isPremium: z.boolean().default(false),
    emailVerified: z.union([z.string().datetime(), z.date()])
        .optional()
        .transform(val => (val === undefined ? undefined : val ? new Date(val) : null)),
});
export type UserType = z.infer<typeof userSchema>;

export const signInSchema = z.object({
    email: z.string()
        .email("Invalid email address")
        .nonempty("Email is required"),

    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .max(32, "Password must be no more than 32 characters long")
        .nonempty("Password is required")
})
export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = signInSchema.extend({
    name: z.string()
        .min(4, "Name must be at least 4 characters long")
        .max(40, "Name must be less than 40 characters long")
        .regex(/^[A-Za-z]+(?:\s+[A-Za-z]+)+$/, "Please enter your full name (first and last)")
        .nonempty("Name is required"),

    confirmPassword: z.string()
        .min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword,
    {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    })

export type SignUpInput = z.infer<typeof signUpSchema>;

export const requestResetPasswordSchema = signInSchema.pick({email: true})
export type RequestResetPasswordInput = z.infer<typeof requestResetPasswordSchema>;


export const resetPasswordSchema = signInSchema.pick({
    password: true,
}).extend({
    confirmPassword: z.string()
        .min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword,
    {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    })
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;



export const appleIdSchema = z.object({
    email: z.string()
        .email("Invalid email address")
        .nonempty("Email is required"),
    password: z
        .string()
        .regex(/^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/, "Invalid app-specific password format"),
})
export type appleIdInput = z.infer<typeof appleIdSchema>;


export const createCalendarGroupSchema = z.object({
    name: z
        .string()
        .min(1, "Group name is required")
        .max(20, "Group name must be under 20 characters"),
    description: z
        .string()
        .max(100, "Description must be under 100 characters")
        .optional(),
    mainCalendarId: z
        .string()
        .nonempty("Main calendar is required"),
    provider: z.union([z.nativeEnum(Provider), z.literal("")])
        .refine((val) => val !== "" && Object.values(Provider).includes(val), {
            message: "Please select a valid provider",
        })
});

export type createCalendarGroupInput = z.infer<typeof createCalendarGroupSchema>;

export const addSecondaryCalendarsSchema = z.object({
    calendars: z.array(
        z.object({
            id: z.string(),
            provider: z.nativeEnum(Provider)
        })),
});

export type AddSecondaryCalendarsInput = z.infer<typeof addSecondaryCalendarsSchema>;