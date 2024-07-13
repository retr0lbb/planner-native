import { Slot } from "expo-router"
import {View, StatusBar} from "react-native"
import {useFonts, Inter_500Medium, Inter_400Regular, Inter_600SemiBold} from "@expo-google-fonts/inter"
import {Loading} from "@/components/loading"
import "@/utils/dayjsLocaleConfig"
import "@/styles/global.css"

export default function Layout(){
    const [loaded, error] = useFonts({
        Inter_500Medium, 
        Inter_400Regular, 
        Inter_600SemiBold
    })

    if(!loaded){
        return <Loading />
    }
    
    return(
        <View className="flex-1 bg-zinc-950">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent/>
            <Slot />
        </View>
    )
}