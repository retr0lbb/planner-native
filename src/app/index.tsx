import { Text, View, Image } from "react-native";
import {Input} from "@/components/input"
import { MapPin, Calendar as LucideCalendar } from "lucide-react-native"
import { colors } from "@/styles/colors";
import { Button } from "@/components/button";


export default function Index(){
    return(
        <View className="flex-1 items-center justify-center px-5">
            <Image source={require("@/assets/logo.png")} className="h-8" resizeMode="contain"/>
            <Text className="text-zinc-400 font-regular text-center text-lg mt-3">
                Convide seus amigos e planeje sua{"\n"}próxima viagem!
            </Text> 

            <View className="w-full bg-zinc-900 p-4 rounded-xl my-8 border border-zinc-800">
                <Input variant="primary">
                    <MapPin color={colors.zinc[400]} size={20}/>
                    <Input.Field placeholder="Para onde?"/>
                </Input>

                <Input variant="primary">
                    <LucideCalendar color={colors.zinc[400]} size={20}/>
                    <Input.Field placeholder="Para onde?"/>
                </Input>

                <View className="border-b py-3 border-zinc-800">

                    <Button>
                        <Button.Title>Alterar local/data</Button.Title>
                    </Button>
                </View>
            </View>
        </View>
    )
}

