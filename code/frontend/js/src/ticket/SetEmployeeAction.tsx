
import { useMemo, useState } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import { Employee } from "../models/Models";
import { Action, Entity } from "../models/QRJsonModel";
import { Loading } from "../components/Various";
import { ErrorView } from "../errors/Error";
import { BASE_URL_API } from "../Urls";
import { useFetch } from "../hooks/useFetch";
import { Collection, CollectionPagination } from "../pagination/CollectionPagination";
import { getEntityOrUndefined, getLink, getProblemOrUndefined, getPropertiesOrUndefined } from '../models/ModelUtils';
import { EMPLOYEE_ROLE } from "../user/Session";
import { Outlet } from "react-router-dom";

export function SetEmployeeAction({action, setAction, setAuxAction, setPayload}: {
    action: Action,
    setAuxAction: React.Dispatch<React.SetStateAction<Action | undefined>>,
    setAction: React.Dispatch<React.SetStateAction<Action | undefined>> | undefined,
    setPayload: React.Dispatch<React.SetStateAction<string>>
}) {

    const initValues: RequestInit = {
        credentials: 'include',
        headers: { 'Request-Origin': 'WebApp' }
    }

    const [direction, setDirection] = useState('desc')
    const [sortBy, setSortBy] = useState('date')
    const [employee, setEmployee] = useState<Employee>()
    const init = useMemo(() => initValues ,[])

    const property = action.properties.find(prop => {if(prop.name === EMPLOYEE_ROLE){ return prop}})
    const href = property?.possibleValues?.href

    const url = href === undefined || null ? '' : BASE_URL_API + href 

    const [currentUrl, setCurrentUrl] = useState(url)
    const { isFetching, result, error } = useFetch<Collection>(currentUrl, init)

    if (!action || !setPayload || !setAction) return null

    if (isFetching) return <Loading/>
    if (error) return <ErrorView/>

    const problem = getProblemOrUndefined(result?.body)
    if (problem) return <ErrorView problemJson={problem}/>

    function EmployeeItem({entity}: {entity: Entity<any>}) {
        if (!entity) return null;
        const employee = entity.properties
        return (
            <div className='flex p-5 bg-white rounded-lg border border-gray-200 shadow-md'>  
                <div className='w-full flex space-x-4'>
                    <h5 className='font-md text-gray-900'>{employee.name}</h5>
                </div>
                <div className='w-full flex justify-end' >
                    <button 
                        className='px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800'
                        onClick= {() => setEmployee(employee)}>
                        Select
                    </button>
                </div>

            </div>
        )
    }

    function Employees({entity}: { entity: Entity<Collection> | undefined }) {

        if(!entity) return null;

        return (
            <div className='flex flex-col space-y-3'>
                {entity.entities!!.map((employee, idx) => <EmployeeItem key={idx} entity={employee}/>)}
            </div>
        )
    }

    return (
        <div className="space-y-3 p-5 bg-green rounded-lg border border-gray-200 shadow-md">
            <button onClick={() => setAuxAction(undefined)}>
                <AiFillCloseCircle style= {{ color: '#db2a0a', fontSize: "1.4em" }}/>
            </button>
            <p>Employee selected: {employee === undefined ? '-----' : employee?.name}</p>
            <Employees entity={getEntityOrUndefined(result?.body)}/>
            <CollectionPagination collection={getPropertiesOrUndefined(result?.body)} setUrlFunction={setCurrentUrl} 
                templateUrl={getLink('pagination', result?.body)}/>
            <Outlet/>
            <div className='flex space-x-4'>
                <button className='w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                    onClick= {() => {setAction(action); setPayload(JSON.stringify({employeeId: employee?.id}))}}>
                    Deliver work
                </button>
            </div>
        </div>
    )
}