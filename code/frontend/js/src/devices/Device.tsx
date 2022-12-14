import { useMemo, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { Navigate, useParams } from "react-router-dom";
import { Loading } from "../components/Various";
import { ErrorView } from "../errors/Error";
import { useFetch } from "../hooks/useFetch";
import { Device } from "../models/Models";
import { Action, Entity } from "../models/QRJsonModel";
import { DEVICE_URL_API, LOGIN_URL } from "../Urls";
import { ActionComponent } from "../components/ActionComponent";
import { ChangeCategory } from "./ChangeCategory";
import { UpdateDevice } from "./UpdateDevice";
import { getEntitiesOrUndefined, getActionsOrUndefined, getEntityOrUndefined, getProblemOrUndefined, getSpecificEntity } from "../models/ModelUtils"
import { Anomalies } from "../anomaly/ListAnomalies";
import { useLoggedInState } from "../user/Session";


export function DeviceRep() {

    const { deviceId } = useParams()

    const initValues: RequestInit = {
        credentials: 'include',
        headers: { 'Request-Origin': 'WebApp' }
    }
    
    const init = useMemo(() => initValues ,[])
    const [action, setAction] = useState<Action | undefined>(undefined)
    const [payload, setPayload] = useState('')
    const [currentUrl, setCurrentUrl] = useState('')
    const userSession = useLoggedInState()

    const { isFetching, result, error } = useFetch<Device>(currentUrl, init)

    if(userSession?.isLoggedIn && currentUrl === '') 
        setCurrentUrl(DEVICE_URL_API(deviceId))
    else if(!userSession?.isLoggedIn) 
        return <Navigate to={LOGIN_URL}/>

    switch (action?.name) {
        case 'create-anomaly': return <ActionComponent action={action} extraInfo={payload} returnComponent={<DeviceRep/>} />
        case 'update-anomaly': return <ActionComponent action={action} extraInfo={payload} returnComponent={<DeviceRep/>} />
        case 'delete-anomaly': return <ActionComponent action={action} returnComponent={<DeviceRep/>} />
        case 'deactivate-device': return <ActionComponent action={action} returnComponent={<DeviceRep/>} />
        case 'activate-device': return <ActionComponent action={action} returnComponent={<DeviceRep/>} />
        case 'update-device': return <ActionComponent action={action} extraInfo={payload} returnComponent={<DeviceRep/>} />
        case 'change-device-category': return <ActionComponent action={action} extraInfo={payload} returnComponent={<DeviceRep/>} />
    }
    
    if (isFetching) return <Loading/>
    if (error) return <ErrorView error={error}/>

    const problem = getProblemOrUndefined(result?.body)
    if (problem) return <ErrorView problemJson={problem}/>

    function DeviceState({state}: {state: string}) {

        const stateColor = state === 'inactive' ? 'bg-red-600' : 'bg-green-600';
        const stateElement = <span className={`${stateColor} py-1 px-2 rounded text-white text-sm`}>{state}</span>
        
        return <span className="ml-auto">{stateElement}</span>
    }

    function DeviceInfo({entity}: {entity: Entity<Device> | undefined}) {

        const [updateAction, setUpdateAction] = useState<Action>()
        if(!entity) return null

        const device = entity.properties

        return (
            <div className='bg-white p-3 border-t-4 border-blue-900 space-y-3'>
                <div className='items-center space-y-4'>
                    <div className="flex items-center space-x-2 font-semibold text-gray-900 leading-8">
                        <span className='text-gray-900 font-bold text-xl leading-8 my-1'>{device.name}</span>
                        {entity.actions?.map((action, idx) => {
                            if(action.name === 'update-device') {
                                return (
                                    !updateAction && (
                                    <button key={idx} className="my-1" onClick={()=> setUpdateAction(action)}>
                                        <FaEdit style= {{ color: 'blue', fontSize: "1.4em" }} /> 
                                    </button>)
                                )
                            }
                        })}
                    </div>
                    <div className='flex flex-col space-y-4'>
                        <p> Category: {device.category} </p>
                    </div>
                    <div> <DeviceState state={device.state}/> </div>
                    {updateAction && <UpdateDevice action={updateAction} setAction={setAction} setAuxAction={setUpdateAction} setPayload={setPayload}/>}
                </div>
            </div>
        )
    }

    function DeviceActions({ actions }: {actions: Action[] | undefined}) {

        const [auxAction, setAuxAction] = useState<Action | undefined>(undefined)
        if(!actions) return null

        let componentsActions = actions?.map((action, idx) => {
            switch(action.name) {
                case 'deactivate-device': return (
                        <button key={idx} onClick={() => setAction(action)} className="w-1/2 bg-red-700 hover:bg-red-900 text-white font-bold py-2 px-4 rounded">
                            {action.title}
                        </button>
                    )
                case 'activate-device': return (
                        <button key={idx} onClick={() => setAction(action)} className="w-1/2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                            {action.title}
                        </button>
                    )
                case 'change-device-category': return (
                    <button key={idx} onClick={() => setAuxAction(action)} className="w-1/2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        {action.title}
                    </button>
                )
            }
        })

        return (
            <>
                <div className="flex space-x-2"> {componentsActions} </div>
                {auxAction?.name === 'change-device-category' && 
                <ChangeCategory action={auxAction} setAction={setAction} setAuxAction={setAuxAction} setPayload={setPayload}/>}
            </>
        ) 
    }
    const entity = getEntityOrUndefined(result?.body)
    if(!entity) return <ErrorView/>
    const entities = getEntitiesOrUndefined(result?.body)
    if(!entities) return <ErrorView/>
    const collection = getSpecificEntity(['anomaly', 'collection'], 'device-anomalies', entities)
    if(!collection) return <ErrorView/>

    return (
        <div className='w-full px-3 pt-3 space-y-3'>
            <DeviceInfo entity={getEntityOrUndefined(result?.body)}/>
            <DeviceActions actions={getActionsOrUndefined(result?.body)}/>
            <Anomalies entity={collection} collection={collection}/>
        </div>
    )

}