import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";
import { Participant, ParticipantProps } from "@/components/participant";
import { TripLink, TripLinkProps } from "@/components/tripLink";
import { linksServer } from "@/server/links-server";
import { participantsServer } from "@/server/participants-server";
import { colors } from "@/styles/colors";
import { validateInput } from "@/utils/validateInput";
import { Plus, Ticket, Trophy } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Text, View, FlatList } from "react-native";

type Props = {
    tripId: string
}
enum MODAL{
    NONE = 0,
    CREATE_LINK = 1
}

export function Details({tripId}: Props){

    const [showModal, setShowModal] = useState(MODAL.NONE)
    const [linkName, setLinkName] = useState("")
    const [linkUrl, setLinkUrl] = useState("")

    const [links, setLinks]=useState<TripLinkProps[]>([])
    const [participants, setParticipants] = useState<ParticipantProps[]>()

    const [isCreatingLink, setIsCreatingLink] = useState(false)
    const [isGettingLinks, setIsGettinLinks] = useState(true)


    async function handleRegisterLink() {
        try {
            if(!validateInput.url(linkUrl.trim())){
                return Alert.alert("Link", "Url do link invalida")
            }
            if(!linkName.trim()){
                return Alert.alert("Link", "Titulo do link invalido")
            }
            setIsCreatingLink(true)
            await linksServer.create({
                tripId: tripId,
                title: linkName,
                url: linkUrl
            })

            Alert.alert("Link", "Link criado com sucesso")
            resetLinkFields()
            await getLinks()

        } catch (error) {
            console.error(error)
        }finally{
            setIsCreatingLink(false)
        }
    }

    async function getLinks() {
        try {
            const links = await linksServer.getLinksByTripId(tripId)
            setLinks(links)

        } catch (error) {
            console.error(error)
        }
    }
    function resetLinkFields(){
        setLinkName("")
        setLinkUrl("")
        setShowModal(MODAL.NONE)
    }
    async function getParticipants(){
        try {
            const participants = await participantsServer.getByTripId(tripId)
            setParticipants(participants)
        } catch (error) {
            
        }
    }

    useEffect(() => {
        getLinks(),
        getParticipants()
    }, [])

    return(
        <View className="flex-1 mt-10">
            <Text className="text-zinc-50 text-2xl font-semibold mb-2">
                Links importates
            </Text>

            <View className="flex-1">

                {links.length > 0
                    ? (<FlatList
                        data={links}
                        keyExtractor={(item) => item.id}
                        renderItem={({item}) => <TripLink data={item} />}
                        contentContainerClassName="gap-4"
                    />)
                    : (
                        <Text className="text-zinc-400 font-regular text-base mt-2 mb-6">Nenhum link adicionado </Text>
                    )
                }

                <Button onPress={()=> setShowModal(MODAL.CREATE_LINK)} variant="secondary">
                    <Plus color={colors.zinc[200]} size={20}/>
                    <Button.Title>
                        Cadastrar novo link
                    </Button.Title>
                </Button>
            </View>


            <View className="flex-1 border-t border-zinc-800 mt-6">
                <Text className="text-zinc-50 text-2xl font-semibold my-6">
                    Convidados
                </Text>


                  <FlatList
                    data={participants}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => <Participant data={item} />}
                    contentContainerClassName="gap-4 pb-44"
                />
            </View>

            <Modal
                title="Cadastrar link"
                subtitle="Todos os convidados podem visualizar os links importantes"
                visible={showModal === MODAL.CREATE_LINK}
                onClose={()=> setShowModal(MODAL.NONE)}
            >
                <View className="gap-2 mb-3">
                    <Input variant="secondary">
                        <Input.Field 
                            placeholder="Titulo do link"
                            onChangeText={setLinkName}
                            value={linkName}
                        />
                    </Input>

                    <Input variant="secondary">
                        <Input.Field 
                            placeholder="URL do link"
                            onChangeText={setLinkUrl}
                            value={linkUrl}
                            inputMode="url"
                        />
                    </Input>

                    <Button isLoading={isCreatingLink} onPress={handleRegisterLink}>
                        <Button.Title>Salvar link</Button.Title>
                    </Button>
                </View>
            </Modal>
        </View>
    )
}