import { FaEdit } from "react-icons/fa"
import { Outlet, useParams } from "react-router-dom"
import { Loading } from "../components/Various";
import { ErrorView } from "../errors/Error";
import { Company } from "../models/Models";
import { Action, Entity } from "../models/QRJsonModel";
import { ActionComponent } from "../components/ActionComponent";
import { getEntitiesOrUndefined, getActionsOrUndefined, getEntityOrUndefined, getProblemOrUndefined, getSpecificEntity } from "../models/ModelUtils"
import { useMemo, useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { COMPANY_URL_API } from "../Urls";
import { InsertCompany } from "./InsertCompany";
import { ListBuildings, BuildingsActions } from "../building/ListBuildings";

export function CompanyRep() {

    const { companyId } = useParams()
    
    const initValues: RequestInit = {
        credentials: 'include',
        headers: { 'Request-Origin': 'WebApp' }
    }
    
    const init = useMemo(() => initValues ,[])
    const [action, setAction] = useState<Action | undefined>(undefined)
    const [payload, setPayload] = useState('')

    const { isFetching, result, error } = useFetch<Company>(COMPANY_URL_API(companyId), init)
    
    switch (action?.name) {
        case 'update-company': return <ActionComponent action={action} extraInfo={payload} returnComponent={<CompanyRep/>} />
        case 'deactivate-company': return <ActionComponent action={action} extraInfo={payload} returnComponent={<CompanyRep/>} />
        case 'activate-company': return <ActionComponent action={action} extraInfo={payload} returnComponent={<CompanyRep/>} />
        case 'create-building': return <ActionComponent action={action} extraInfo={payload} returnComponent={<CompanyRep/>} />
    }

    if (isFetching) return <Loading/>
    if (error !== undefined) return <ErrorView error={error} />
    
    const problem = getProblemOrUndefined(result?.body)
    if (problem) return <ErrorView problemJson={problem} />

    function CompanyState({state}: { state: string}) {

        const stateColor = state === 'inactive' ? 'bg-red-600' : 'bg-green-600';
        const stateElement = <span className={`${stateColor} ml-auto py-1 px-2 rounded text-white text-sm`}>{state}</span>
        
        return (
            <li className="flex items-center py-3"><span>Status</span>{stateElement}</li>
        )
    }

    function CompanyDate({state, time}: {state: string, time: string}) {
        const text = state === 'inactive' ? 'Inactive since' : 'Active since';
        
        return (
            <div className="flex items-center py-3">
                <span>{text}</span> <span className="ml-auto">{`${time}`}</span>
            </div>
        )
    }    

    function CompanyInfo({entity}: {entity: Entity<Company> | undefined}) {

        const [updateAction, setUpdateAction] = useState<Action>()
        if(!entity) return null

        const company = entity.properties

        return (
            <div className='bg-white p-3 border-t-4 border-blue-900 space-y-3'>
                <div className='items-center space-y-4'>
                    <div className="flex items-center space-x-2 font-semibold text-gray-900 leading-8">
                        <span className='text-gray-900 font-bold text-xl leading-8 my-1'>{company.name}</span>
                            {entity.actions?.map((action, idx) => {
                                if(action.name === 'update-company') {
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
                        {/*<p> Number of buildings: {company.numberOfBuildings} </p>*/}
                    </div>
                    <ul className="bg-gray-100 text-gray-600 hover:text-gray-700 hover:shadow py-2 px-3 mt-3 divide-y rounded shadow-sm">
                        <CompanyState state={company.state}/>
                        <CompanyDate state={company.state} time={`${new Date(company.timestamp).toLocaleDateString()}`}/>
                    </ul>
                    {updateAction && <InsertCompany action={updateAction} setAction={setAction} setAuxAction={setUpdateAction} setPayload={setPayload}/>}
                </div>
            </div>
        )
    }

    function CompanyActions({ actions }: {actions: Action[] | undefined}) {

        if(!actions) return null

        let componentsActions = actions?.map((action, idx) => {
            switch(action.name) {
                case 'deactivate-company': return (
                        <button key={idx} onClick={() => setAction(action)} className="bg-red-700 hover:bg-red-900 text-white font-bold py-2 px-4 rounded">
                            {action.title}
                        </button>
                    )
                case 'activate-company': return (
                        <button key={idx} onClick={() => setAction(action)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                            {action.title}
                        </button>
                    )
            }
        })
        return <div className="flex space-x-2"> {componentsActions} </div>
    }

    const entities = getEntitiesOrUndefined(result?.body)
    if(!entities) return <ErrorView/>
    const collection = getSpecificEntity(['building', 'collection'], 'company-buildings', entities)
    if(!collection) return <ErrorView/>
    
    return (
        <div className='w-full px-3 pt-3 space-y-3'>    
            <CompanyInfo entity={getEntityOrUndefined(result?.body)}/>
            <CompanyActions actions={getActionsOrUndefined(result?.body)}/>
            <BuildingsActions collection={collection} setAction={setAction} setPayload={setPayload}/>
            <ListBuildings collection={collection}/>
        </div>
    )
}