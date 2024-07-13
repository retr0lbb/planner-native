import { Text, View, Image, Keyboard, Alert } from "react-native";
import {Input} from "@/components/input"
import { MapPin, Calendar as LucideCalendar, Settings2, UserRoundPlus, ArrowRight, AtSign } from "lucide-react-native"
import { colors } from "@/styles/colors";
import { Button } from "@/components/button";
import { useState } from "react";
import { Modal } from "@/components/modal";
import { Calendar } from "@/components/calendar";
import {calendarUtils, DatesSelected} from "@/utils/calendarUtils"
import { DateData } from "react-native-calendars";
import dayjs from "dayjs";
import { GuestEmail } from "@/components/email";

enum StepForm {
    TRIP_DETAILS = 1,
    ADD_EMAIL = 2
}
enum MODAl{
    NONE = 0,
    CALENDAR = 1,
    GUESTS = 2
}

export default function Index(){

    const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS)
    const [showModal, setShowModal]= useState(MODAl.NONE)
    const [destination, setDestination] = useState("")
    const [emailsToInvite, setEmailsToInvide] = useState<string[]>([])
    const [emailToinvite, setEmailToInvite] = useState("")

    const [selectedDates, setSelectedDates] = useState({} as DatesSelected)

    function handleNextStepForm(){
        if(destination.trim().length <= 0 || !selectedDates.startsAt || !selectedDates.endsAt){
            return Alert.alert("Validação de viagem", "Preencha todos os campos corretamente")
        }
        if(destination.trim().length < 4){
            return Alert.alert("Detalhe da Viagem", "O nome do destino deve ter no minimo 4 caracteres.")
        }
        if(stepForm === StepForm.TRIP_DETAILS){
            return setStepForm(StepForm.ADD_EMAIL)
        }
    }

    function handleSelecDate(selectedDay: DateData){
        const dates = calendarUtils.orderStartsAtAndEndsAt({
            startsAt: selectedDates.startsAt,
            endsAt: selectedDates.endsAt,
            selectedDay
        })

        setSelectedDates(dates)
    }

    return(
        <View className="flex-1 items-center justify-center px-5">
            <Image 
                source={require("@/assets/logo.png")} 
                className="h-8" 
                resizeMode="contain"
            />

            <Image
                source={(require("@/assets/bg.png"))}
                className="absolute"
            />


            <Text className="text-zinc-400 font-regular text-center text-lg mt-3">
                Convide seus amigos e planeje sua{"\n"}próxima viagem!
            </Text> 

            <View className="w-full bg-zinc-900 p-4 rounded-xl my-8 border border-zinc-800">
                <Input variant="primary">
                    <MapPin color={colors.zinc[400]} size={20}/>
                    <Input.Field 
                        placeholder="Para onde?" 
                        editable={stepForm === StepForm.TRIP_DETAILS}
                        value={destination}  
                        onChangeText={setDestination} 
                    />
                </Input>

                <Input variant="primary">
                    <LucideCalendar color={colors.zinc[400]} size={20}/>
                    <Input.Field 
                        value={selectedDates.formatDatesInText}
                        placeholder="Quando?" 
                        editable={stepForm === StepForm.TRIP_DETAILS}
                        onFocus={()=> Keyboard.dismiss()}
                        showSoftInputOnFocus={false}
                        onPressIn={() => stepForm === StepForm.TRIP_DETAILS && setShowModal(MODAl.CALENDAR)}
                    />
                </Input>

                {stepForm === StepForm.ADD_EMAIL && (
                    <>
                    <View className="border-b py-3 border-zinc-800">
                        <Button onPress={() => setStepForm(StepForm.TRIP_DETAILS) } variant="secondary">
                            <Button.Title>Alterar local/data</Button.Title>
                            <Settings2 color={colors.zinc[200]} size={20}/>
                        </Button>
                    </View>

                    <Input variant="primary">
                        <UserRoundPlus color={colors.zinc[400]} size={20}/>
                        <Input.Field placeholder="Quem estará na viagem?"/>
                    </Input>
                </>
                )}
                

                <Button onPress={handleNextStepForm}>
                    <Button.Title>
                        {
                        stepForm === StepForm.TRIP_DETAILS? "Continuar": "Confirmar Viagem"
                        }
                    </Button.Title>
                    <ArrowRight color={colors.lime[950]} size={20}/>
                </Button>
            </View>

            <Text className="text-zinc-500 font-regular text-center text-base">
                Ao planejar sua viagem pela plann.er você automaticamente concorda com 
                nossos{" "} <Text className="text-zinc-300 underline">termos de uso e de políticas de privacidade.</Text>
            </Text>


            <Modal 
                title="Selecionar Datas" 
                subtitle="Selecione a data de ida e de volta da sua viagem."
                visible={showModal === MODAl.CALENDAR}
                onClose={() => {setShowModal(MODAl.NONE)}}
            >
                <View className="gap-4 mt-4">
                    <Calendar 
                        minDate={dayjs().toISOString()}
                        onDayPress={handleSelecDate}
                        markedDates={selectedDates.dates}
                    /> 
                    <Button onPress={() => setShowModal(MODAl.NONE)}>
                        <Button.Title>Confirmar</Button.Title>
                    </Button>
                </View>
            </Modal>

            <Modal 
                title="Selecionar convidados" 
                subtitle="Os convidados irão receber e-mails para confirmar a participação na viagem."
            >
                <View className="my-2 flex-wrap gap-2 border-b border-zinc-800 py-5 items-start">
                    <GuestEmail email="retr0lbb@gmail.com" onRemove={() => {}} />
                </View>

                <View className="gap-4 mt-4">
                    <Input variant="secondary">
                        <AtSign 
                            color={colors.zinc[400]}
                            size={20}
                        />
                        <Input.Field 
                            placeholder="Digite o email do convidado"
                            keyboardType="email-address"
                        />
                    </Input>
                    <Button>
                        <Button.Title>Convidar</Button.Title>
                    </Button>
                </View>

            </Modal>
        </View>
    )
}

