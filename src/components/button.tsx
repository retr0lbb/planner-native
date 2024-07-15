import { Text, TextProps, Pressable, PressableProps, ActivityIndicator } from "react-native";
import {createContext, useContext} from "react"
import clsx from "clsx";

type Variants = "primary" | "secondary"
type ButtonProps = PressableProps & {
    variant?: Variants,
    isLoading?: boolean
}


const themeContext = createContext<{variant?: Variants}>({})

function Button({ variant = "primary", isLoading = false , children, className, ...rest}: ButtonProps){
    return (
        <Pressable
            className={
                clsx(
                    "h-11 flex-row items-center justify-center rounded-lg gap-2 px-2",
                    {
                        "bg-lime-300": variant === "primary",
                        "bg-zinc-800": variant === "secondary"
                    },
                    className
                )}
                disabled={isLoading}
            {...rest}
        >
            <themeContext.Provider value={{variant}}>
                {isLoading? <ActivityIndicator className="text-lime-950"/> : (children as any)}
            </themeContext.Provider>
        </Pressable>
    )
}

function Title({children}: TextProps){
    const { variant } = useContext(themeContext)
    return (
        <Text
            className={clsx(
                "text-base font-semibold",
                {
                    "text-lime-950" : variant === "primary",
                    "text-zinc-200" : variant === "secondary"
                }
            )}
        >
            {children}
        </Text>
    )
}

Button.Title = Title

export { Button }