
import { api } from "./api";


export interface TripDetails {
    id: string
    destination: string
    starts_at: string
    ends_at: string
    is_confirmed: boolean
}

interface TripCreate extends Omit<TripDetails, "id" | "is_confirmed"> {
    emails_to_invite: string[]
}

async function getById(id: string) {
    try {
        const { data } = await api.get<{ tripDetails: TripDetails }>(`/trips/${id}`)
        return data.tripDetails
    } catch (error) {
        throw error
    }
}

async function create({destination, ends_at, starts_at, emails_to_invite}: TripCreate) {
    try {
        const { data } = await api.post<{ data: string}>("/trips", {
            destination,
            emails_to_invite,
            ends_at,
            starts_at,
            owner_name: "Henrique Barbosa Sampaio",
            owner_email: "retr0lbb@gmail.com"
        })

        return {tripId: data.data}

    } catch (error) {
        console.log(error)
        throw error
    }
}

async function update({destination, ends_at, starts_at, id}:Omit<TripDetails, "is_confirmed">){
    try {
        await api.put(`/trips/${id}`, {
            destination, 
            ends_at, 
            starts_at
        })
    } catch (error) {
        throw error
    }
}

export const tripServer = { getById, create, update }