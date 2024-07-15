import {  Alert, Keyboard, Pressable, Text, View } from "react-native";
import {router, useLocalSearchParams} from "expo-router"
import { useEffect, useState } from "react";
import { TripDetails, tripServer } from "@/server/trip-server";
import { Loading } from "@/components/loading";
import { Input } from "@/components/input";
import { CalendarRange, Info, MapPin, Settings2, Calendar as LRCalendar, User, Mail } from "lucide-react-native";
import { colors } from "@/styles/colors";
import dayjs from "dayjs";
import { Button } from "@/components/button";
import { Activities } from "./activities";
import { Details } from "./details";
import { Modal } from "@/components/modal";
import { Calendar } from "@/components/calendar";
import { DateData } from "react-native-calendars";
import { calendarUtils, DatesSelected } from "@/utils/calendarUtils";
import { validateInput } from "@/utils/validateInput";
import { participantsServer } from "@/server/participants-server";
import { tripStorage } from "@/storage/trip";
export type TripData = TripDetails & {when: string}

enum MODAL{
    NONE = 0,
    UPDATE_TRIP = 1,
    CALENDAR = 2,
    CONFIRM_TRIP = 3
}

export default function Trip(){
    
    const tripParams = useLocalSearchParams<{id: string , participant: string}>()

    const [isLoadingTrip, setIsLoadingTrip] = useState(true)
    const [tripDetails, setTripDetails] = useState({} as TripData)
    const [option, setOption] = useState<"activity" | "details">("activity")
    const [destination, setDestination] = useState("")
    const [showModal, setShowModal] = useState(MODAL.NONE)
    const [selectedDates, setSelectedDates] = useState({} as DatesSelected)
    const [isUpdatingTrip, setIsUpdatingTrip] = useState(false)
    
    const [guestName, setGuestName] = useState("")
    const [guestEmail, setGuestEmail] = useState("")
    const [isConfirmingAttendance, setIsConfirmingAttendance] = useState(false)


    async function getTripDetails() {
        try {
            setIsLoadingTrip(true)

            if(!tripParams.id){
                return router.back()
            }

            const trip = await tripServer.getById(tripParams.id)
            
            const maxLengthDestination = 14
            const destination = trip.destination.length > maxLengthDestination 
                ? trip.destination.slice(0, maxLengthDestination) + "..." 
                : trip.destination

                const starts_at = dayjs(trip.starts_at).format("DD")
                const ends_at = dayjs(trip.ends_at).format("DD")
                const mounth = dayjs(trip.starts_at).format("MMM")

            setDestination(trip.destination)
            setTripDetails({
                ...trip,
                when: `${destination} de ${starts_at} a ${ends_at} de ${mounth}`
            })
        } catch (error) {
            console.log(error)
        }finally{
            setIsLoadingTrip(false)
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
    async function handleUpdateTrip(){
        try {
            if(!tripParams.id){
                return
            }

            if(destination.trim().length <= 0 || !selectedDates.startsAt || !selectedDates.endsAt){
                return Alert.alert("Validação de viagem", "Preencha todos os campos corretamente")
            }

            setIsUpdatingTrip(true)

            await tripServer.update({
                destination,
                ends_at: dayjs(selectedDates.endsAt.dateString).toString(),
                starts_at: dayjs(selectedDates.startsAt.dateString).toString(),
                id: tripParams.id
            })

            Alert.alert("Atualizar viagem", "Viagem atualizada com sucesso!", [{
                text: "Ok",
                onPress: () => {
                    setShowModal(MODAL.NONE)
                    getTripDetails()
                } 
            }])
            
        } catch (error) {
            console.log(error)
        }finally{
            setIsUpdatingTrip(false)
        }
    }
    async function handleSubmitPresence() {
        try {
            if(!tripParams.participant || !tripParams.id){
                return
            }

            if( !guestName.trim() || !guestEmail.trim()){
                Alert.alert("Confirmação", "Preencha todos os campos")
            }

            if(validateInput.email(guestEmail.trim())){
                Alert.alert("Confirmação", "Email invalido")
            }
            

            setIsConfirmingAttendance(true)

            await participantsServer.confirmTripByParticipantId({
                participantId: tripParams.participant,
                email: guestEmail,
                name: guestName
            })

            Alert.alert("Confirmação", "Participante confirmado com sucesso")

            await tripStorage.save(tripParams.id)
            setShowModal(MODAL.NONE)
            
        } catch (error) {
            console.error(error)
        }finally{
            setIsConfirmingAttendance(false)
        }
    }

    useEffect(()=>{
        getTripDetails()
    }, [])

    if(isLoadingTrip){
        return <Loading />
    }
    
    return <View className="flex-1 px-5 pt-16">
        <Input variant="tertiary">
            <MapPin color={colors.zinc[400]} size={20} />
            <Input.Field value={tripDetails.when} readOnly />

            <Pressable onPress={() => setShowModal(MODAL.UPDATE_TRIP)} className="size-9 bg-zinc-800 items-center justify-center rounded">
                <Settings2 color={colors.zinc[400]} size={20} />
            </Pressable>
        </Input>

        {
            option === "activity" && (
                <Activities tripDetails={tripDetails} />
            )
        }
        {
            option === "details" && (
                <Details tripId={tripDetails.id} />
            )
        }

        <View className="w-full absolute -bottom-1 self-center justify-end pb-5 z-10 bg-zinc-950">
            <View className="w-full flex-row bg-zinc-900 p-4 rounded-lg border border-zinc-800 gap-2">
                <Button 
                    className="flex-1" 
                    onPress={() => setOption("activity")}
                    variant={option === "activity"? "primary" : "secondary"}    
                >
                    <CalendarRange size={20} color={option === "activity"? colors.lime[950] : colors.zinc[200]} />
                    <Button.Title>Atividades</Button.Title>
                </Button>

                <Button 
                    className="flex-1" 
                    onPress={() => setOption("details")}
                    variant={option === "details"? "primary" : "secondary"}    
                >
                    <Info size={20} color={option === "details"? colors.lime[950] : colors.zinc[200]} />
                    <Button.Title>Detalhes</Button.Title>
                </Button>
            </View>
        </View>


        <Modal
            title="Atualizar viagem"
            subtitle="Somente quem criou a viagem pode altera-la."
            visible={showModal === MODAL.UPDATE_TRIP}
            onClose={() => setShowModal(MODAL.NONE)}
        >
            <View className="gap-2 my-4">
                <Input variant="secondary">
                    <MapPin color={colors.zinc[400]} size={20} />
                    <Input.Field placeholder="Para onde?" value={destination} onChangeText={setDestination} />
                </Input>

                <Input variant="secondary">
                    <LRCalendar color={colors.zinc[400]} size={20} />
                    <Input.Field 
                        placeholder="Quando?" 
                        value={selectedDates.formatDatesInText}
                        onPressIn={() => {
                            setShowModal(MODAL.CALENDAR)
                        }}
                        onFocus={()=> Keyboard.dismiss()}
                        
                    />
                </Input>

                <Button onPress={handleUpdateTrip} isLoading={isUpdatingTrip}>
                    <Button.Title>Atualizar</Button.Title>
                </Button>
            </View>
        </Modal>


        <Modal 
            title="Selecionar Datas" 
            subtitle="Selecione a data de ida e de volta da sua viagem."
            visible={showModal === MODAL.CALENDAR}
            onClose={() => {setShowModal(MODAL.NONE)}}
        >

            <View className="gap-4 mt-4">
                <Calendar 
                    minDate={dayjs().toISOString()}
                    onDayPress={handleSelecDate}
                    markedDates={selectedDates.dates}
                /> 
                <Button onPress={() => setShowModal(MODAL.UPDATE_TRIP)}>
                    <Button.Title>Confirmar</Button.Title>
                </Button>
            </View>
        </Modal>

        <Modal
            title="Confirmar presença"
            visible = {showModal==MODAL.CONFIRM_TRIP}
        >
            <View className="gap-4 mt-4">
                <Text className="text-zinc-400 font-regular leading-6 my-2">
                    Você foi convidado(a) para participar de uma viagem para
                    <Text className="font-semibold text-zinc-100">{" "}{tripDetails.destination}{" "}</Text>
                    nas datas de
                        <Text className="font-semibold text-zinc-100">
                        {" "}{dayjs(tripDetails.starts_at).date()} a{" "}
                            {dayjs(tripDetails.ends_at).date()} de{" "}
                            {dayjs(tripDetails.starts_at).format("MMMM ")}. {"\n\n"}
                        </Text>
                        Para confirmar sua presença na viagem preencha os dados abaixo  
                </Text>

                <Input variant="secondary">
                    <User color={colors.zinc[400]} size={20} />
                    <Input.Field
                        placeholder="Seu nome completo"
                        onChangeText={setGuestName}
                        value={guestName}
                    />
                </Input>

                <Input variant="secondary">
                    <Mail color={colors.zinc[400]} size={20} />
                    <Input.Field
                        value={guestEmail}
                        placeholder="E-mail de confirmação"
                        onChangeText={setGuestEmail}
                    />
                </Input>

                <Button isLoading={isConfirmingAttendance} onPress={handleSubmitPresence}>
                    <Button.Title>Confirmar minha presença</Button.Title>
                </Button>
            </View>
        </Modal>
    </View>
}