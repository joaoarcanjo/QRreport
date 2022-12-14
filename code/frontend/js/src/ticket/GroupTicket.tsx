import { useMemo, useState } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import { Ticket } from "../models/Models";
import { Action, Entity } from "../models/QRJsonModel";
import { Loading } from "../components/Various";
import { ErrorView } from "../errors/Error";
import { BASE_URL_API } from "../Urls";
import { useFetch } from "../hooks/useFetch";
import { Collection } from "../pagination/CollectionPagination";
import { getEntityOrUndefined, getProblemOrUndefined } from '../models/ModelUtils';

export function GroupTicket({ticketId, action, setAction, setAuxAction, setPayload}: {
    ticketId: number, 
    action: Action,
    setAuxAction: React.Dispatch<React.SetStateAction<Action | undefined>>,
    setAction: React.Dispatch<React.SetStateAction<Action | undefined>> | undefined,
    setPayload: React.Dispatch<React.SetStateAction<string>>
}) {

    const initValues: RequestInit = {
        credentials: 'include',
        headers: { 'Request-Origin': 'WebApp' }
    }

    const [ticket, setTicket] = useState<Ticket>()
    const init = useMemo(() => initValues ,[])

    const property = action.properties.find(prop => {if(prop.name === 'ticket'){ return prop}})
    const href = property?.possibleValues?.href

    const url = href === undefined || null ? '' : BASE_URL_API + href 
    
    const { isFetching, result, error } = useFetch<Collection>(url, init)

    if (!action || !setPayload || !setAction) return null

    if (isFetching) return <Loading/>
    if (error) return <ErrorView/>

    const problem = getProblemOrUndefined(result?.body)
    if (problem) return <ErrorView problemJson={problem}/>

    function TicketItem({entity}: {entity: Entity<any>}) {
        if (!entity) return null;
        const ticket = entity.properties
        if(ticket.id === ticketId) return <></>
        return (
            <div className='flex p-5 bg-white rounded-lg border border-gray-200 shadow-md'>  
                <div className='w-full flex space-x-4'>
                    <h5 className='font-md text-gray-900'>{ticket.subject}</h5>
                </div>
                <div className='w-full flex justify-end' >
                    <button 
                        className='px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800'
                        onClick= {() => setTicket(ticket)}>
                        Select
                    </button>
                </div>

            </div>
        )
    }

    function Tickets({entity}: { entity: Entity<Collection> | undefined }) {

        if(!entity) return null;

        return (
            <div className='flex flex-col space-y-3'>
                {entity.entities!!.map((ticket, idx) => <TicketItem key={idx} entity={ticket}/>)}
            </div>
        )
    }

    return (
        <div className="space-y-3 p-5 bg-green rounded-lg border border-gray-200 shadow-md">
            <button onClick={() => setAuxAction(undefined)}>
                <AiFillCloseCircle style= {{ color: '#db2a0a', fontSize: "1.4em" }}/>
            </button>
            <p>Ticket selected: {ticket === undefined ? '-----' : ticket.subject}</p>
            <Tickets entity={getEntityOrUndefined(result?.body)}/>
            <div className='flex space-x-4'>
                <button className='w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                    onClick= {() => {setAction(action); setPayload(JSON.stringify({ticket: ticket?.id}))}}>
                    Group ticket
                </button>
            </div>
        </div>
    )
}