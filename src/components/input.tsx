import { ReactNode } from "react"
import { TextInput, TextInputProps, View, ViewProps, Platform } from "react-native"
import { colors } from "@/styles/colors"
import clsx from "clsx"



interface InputProps extends ViewProps{
    variant?: Variants,
}

type Variants = "primary" | "secondary" | "tertiary"

export function Input({children, className, variant = "primary", ...rest}:InputProps){
    return (
        <View className={clsx(
            "min-h-16 max-h-16 flex-row items-center gap-2",
            {
                "h-14 px-4 rounded-lg border border-zinc-800": variant !== "primary",
                "bg-zinc-950": variant === "secondary",
                "bg-zinc-900": variant === "tertiary",
            },
            className
        )} {...rest}>
            {children}
        </View>
    )
}

function Field({ ...rest }: TextInputProps){
    return (
        <TextInput 
            className="flex-1 text-zinc-100 text-lg font-regular" 
            placeholderTextColor={colors.zinc[400]} 
            cursorColor={colors.zinc[100]} {...rest}
            selectionColor={Platform.OS === "ios"? colors.zinc[100]: undefined}
        />
    )
}

Input.Field = Field