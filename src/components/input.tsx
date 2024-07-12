import { ReactNode } from "react"
import { TextInput, View } from "react-native"
import clsx from "clsx"



interface InputProps{
    children: ReactNode,
    variant?: Variants
}

type Variants = "primary" | "secondary" | "tertiary"

export function Input({children, variant = "primary" }:InputProps){
    return (
        <View className={clsx()}>
            {children}
        </View>
    )
}

function Field(){
    return (
        <TextInput />
    )
}

Input.Field = Field