import { Alert, Keyboard, Text, View, SectionList } from "react-native";
import {TripData} from "./[id]"
import { Button } from "@/components/button";
import { Calendar, Clock, Plus, PlusIcon, Tag, Ticket } from "lucide-react-native";
import { Calendar as FNCalendar } from "@/components/calendar";
import { colors } from "@/styles/colors";
import { Modal } from "@/components/modal";
import { useEffect, useState } from "react";
import { Input } from "@/components/input";
import dayjs from "dayjs";
import { activitiesServer } from "@/server/activities-server";
import { Activity, ActivityProps } from "@/components/activity";
import { Loading } from "@/components/loading";

type Props = {
    tripDetails: TripData
}
enum MODAL{
    NONE = 0,
    CALENDAR = 1,
    NEW_ACTIVITY = 2
}
type TripActivities = {
    title: {
        dayNumber: number,
        dayName: string
    },
    data: ActivityProps[]
}


export function Activities({tripDetails}: Props){
    const [showModal, setShowModal] = useState(MODAL.NONE)

    const [activityTitle, setActivityTitle] = useState("")
    const [activityDate, setActivityDate] = useState("")
    const [activityHour, setActivityHour] = useState("")

    const [isCreatingActivity, setIsCreatingActivity] = useState(false)
    const [isLoadingActivities, setIsLoadingActivities] = useState(true)

    const [tripActivities, setTripActivities] = useState<TripActivities[]>([])

    async function handleCreateActivity(){
        try {
            if(!activityTitle || !activityDate || !activityHour){
                return Alert.alert("Cadastrar atividade", "Preencha todos os campos necessario")
            }

            setIsCreatingActivity(true)

            const result = await activitiesServer.create({
                title: activityTitle,
                tripId: tripDetails.id,
                occurs_at: dayjs(activityDate).add(Number(activityHour), "h").toString()
            })

            Alert.alert("Nova atividade", "nova atividade cadastrada com sucesso")
            await getTripActivities()
            resetActivityFields()
            setShowModal(MODAL.NONE)
        } catch (error) {
            
        }finally{
            setIsCreatingActivity(false)
        }
    }
    function resetActivityFields(){
        setActivityDate("")
        setActivityHour("")
        setActivityTitle("")
    }
    async function getTripActivities(){
        try {
            const activities = await activitiesServer.getActivitiesByTripId(tripDetails.id)

            const activitiesToSectionList = activities.map((dayActivity) => ({
                title: {
                    dayNumber: dayjs(dayActivity.date).date(),
                    dayName: dayjs(dayActivity.date).format("dddd").replace("-feira", "")
                },
                data: dayActivity.activities.map(( activity ) => ({
                    id: activity.id,
                    title: activity.title,
                    hour: dayjs(activity.occurs_at).format("hh[:]mm[h]"),
                    isBefore: dayjs(activity.occurs_at).isBefore(dayjs())
                }))
            })) 

            setTripActivities(activitiesToSectionList)
            
        } catch (error) {
            console.error(error)
        }finally{
            setIsLoadingActivities(false)
        }
    }


    useEffect(()=> {
        getTripActivities()
    }, [])

    return(
        <View className="flex-1">
            <View className="w-full flex-row mt-5 mb-6 items-center">
                <Text className="text-zinc-50 text-2xl font-semibold flex-1">
                    Atividades
                </Text>
                <Button onPress={() => setShowModal(MODAL.NEW_ACTIVITY)}>
                    <PlusIcon color={colors.lime[950]} />
                    <Button.Title>Nova Atividade</Button.Title>
                </Button>
            </View>

            {isLoadingActivities    
            ? (<Loading />)
            : (<SectionList
                sections={tripActivities}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <Activity data={item} />}
                renderSectionHeader={({section}) => (
                    <View className="w-full">
                        <Text className="text-zinc-50 text-2xl font-semibold py-2">
                            Dia {section.title.dayNumber + " "}
                            <Text className="text-zinc-500 text-base font-regular capitalize">
                                {section.title.dayName}
                            </Text>
                        </Text>

                        {
                            section.data.length === 0 && (
                                <Text className="text-zinc-500 font-regular text-sm mb-8">
                                    Nenhuma atividade cadastrada nessa data.
                                </Text>
                            )
                        }
                    </View>
                )}
                contentContainerClassName="gap-3 pb-48"
                showsVerticalScrollIndicator={false}
            />
            )}


            <Modal 
                title="Cadastrar atividade" 
                subtitle="Todos os convidados podem visualizar as atividades"
                visible={showModal === MODAL.NEW_ACTIVITY}
                onClose={() => setShowModal(MODAL.NONE)}    
            >
                <View className="mt-4 mb-3">
                    <Input variant="secondary">
                        <Tag color={colors.zinc[400]} size={20} />
                        <Input.Field 
                            placeholder="Qual Atividade?" 
                            onChangeText={setActivityTitle} 
                            value={activityTitle}/>
                    </Input>

                    <View className="w-full mt-2 flex-row gap-2">
                        <Input variant="secondary" className="flex-1">
                            <Calendar color={colors.zinc[400]} size={20} />
                            <Input.Field 
                                placeholder="Data" 
                                value={activityDate ? dayjs(activityDate).format("DD [de] MMM"): ""}
                                onChangeText={setActivityTitle} 
                                onFocus={()=> Keyboard.dismiss()}
                                showSoftInputOnFocus={false}
                                onPressIn={() => setShowModal(MODAL.CALENDAR)}
                            />
                        </Input>
                        <Input variant="secondary" className="flex-1">
                            <Clock color={colors.zinc[400]} size={20} />
                            <Input.Field 
                                placeholder="Horario" 
                                onChangeText={(text) => setActivityHour(text.replace(".", "").replace(",", ""))} 
                                value={activityHour}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                        </Input>
                    </View>
                    <Button onPress={handleCreateActivity} isLoading={isCreatingActivity}>
                        <Button.Title>Salvar Atividade</Button.Title>
                    </Button>
                </View>
            </Modal>

            <Modal
                title="Selecionar Data"
                subtitle="Selecione a data da atividade"
                visible={showModal === MODAL.CALENDAR}
                onClose={() => setShowModal(MODAL.NONE )}    
            >
                <View className="gap-4 mt-4">
                    <FNCalendar
                        onDayPress={(day) => setActivityDate(day.dateString)}
                        markedDates={{ [activityDate] : {selected: true}}}
                        initialDate={tripDetails.starts_at.toString()}
                        minDate={tripDetails.starts_at.toString()}
                        maxDate={tripDetails.ends_at.toString()}
                    />

                    <Button onPress={()=> setShowModal(MODAL.NEW_ACTIVITY)}>
                        <Button.Title>Confirmar</Button.Title>
                    </Button>
                </View>
            </Modal>
        </View>
    )
}