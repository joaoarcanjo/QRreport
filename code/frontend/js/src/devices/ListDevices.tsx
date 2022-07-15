import { useMemo, useState } from "react"
import { Loading } from "../components/Various"
import { DisplayError } from "../Error"
import { useFetch } from "../hooks/useFetch"
import { Device } from "../models/Models"
import { Action, Entity } from "../models/QRJsonModel"
import { Collection } from "../pagination/CollectionPagination"
import { DEVICES_URL_API } from "../Urls"
import { InsertDevice } from "./InsertDevice"
import { getEntitiesOrUndefined, getActionsOrUndefined } from "../models/ModelUtils"
import { ActionComponent } from "../user/profile/ActionRequest"
import { MdOutlineCategory } from "react-icons/md"
import { Link } from "react-router-dom"

export function ListDevices() {

    const initValues: RequestInit = {
        credentials: 'include',
        headers: { 'Request-Origin': 'WebApp' }
    }
    
    const init = useMemo(() => initValues ,[])
    const [action, setAction] = useState<Action | undefined>(undefined)
    const [payload, setPayload] = useState('')

    const { isFetching, isCanceled, result, error } = useFetch<Collection>(DEVICES_URL_API, init)

    switch (action?.name) {
        case 'create-device': return <ActionComponent action={action} extraInfo={payload} returnComponent={<ListDevices/>} />
    }
   
    if (isFetching) return <Loading/>
    if (isCanceled) return <p>Canceled</p>
    if (error !== undefined) return <DisplayError error={error}/>
    
    function DeviceItemComponent({entity}: {entity: Entity<Device>}) {
        const device = entity.properties

        const bgColor = device.state === 'active' ? 'bg-white' : 'bg-red-100'
        
        return (
            <div>
                <Link to={`${device.id}`}>
                    <div className={`p-5 ${bgColor} rounded-lg border border-gray-200 shadow-md hover:bg-gray-200 divide-y space-y-4`}>  
                        <div>
                            <h5 className='mb-2 text-xl tracking-tight text-gray-900'>{device.name}</h5>   
                            <div className='flex text-s items-center space-x-2 text-gray-700'>
                                <MdOutlineCategory/><span>: {device.category} </span>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        )
    }
    
    function DevicesActions({actions}: {actions: Action[] | undefined}) {

        const [auxAction, setAuxAction] = useState<Action | undefined>(undefined)

        let componentsActions = actions?.map(action => {
            switch(action.name) {
                case 'create-device': return (
                        <button onClick={() => setAuxAction(action)} className="text-white bg-blue-700 hover:bg-blue-800 rounded-lg px-2">
                            {action.title}
                        </button>
                    )
            }
        })

        return (
            <>
                <div className="flex space-x-2">{componentsActions} </div>
                {auxAction?.name === 'create-device' && 
                <InsertDevice action={auxAction} setAction={setAction} setAuxAction={setAuxAction} setPayload={setPayload}/>}
            </>
        )
    }

    function Devices({ entities }: { entities?: Entity<Device>[]}) {
        if (!entities) return null
        
        return (
            <div className="space-y-3">
                {entities.map((entity, idx) => {
                    if (entity.class.includes('device') && entity.rel?.includes('item')) {
                        return <DeviceItemComponent key={idx} entity={entity}/>
                    }
                })}
            </div>
        )
    }

    return (
        <div className='px-3 pt-3 space-y-4'>
            <h1 className='text-3xl mt-0 mb-2 text-blue-800'>Devices</h1>
            <DevicesActions actions={getActionsOrUndefined(result?.body)}/>
            <Devices entities={getEntitiesOrUndefined(result?.body)}/>
        </div>
    )
}