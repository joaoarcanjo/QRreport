
import { useMemo, useState } from "react";
import { MdFilterList } from "react-icons/md";
import { TbArrowBigTop, TbArrowBigDown } from "react-icons/tb";
import { AiFillTool, AiFillStar, AiFillCloseCircle } from "react-icons/ai";
import { Employee, Ticket } from "../Models";
import { Action, Entity } from "../models/QRJsonModel";
import { Loading } from "../components/Various";
import { DisplayError } from "../Error";
import { BASE_URL_API } from "../Urls";
import { useFetch } from "../hooks/useFetch";
import { Collection } from "../pagination/CollectionPagination";
import { getEntityOrUndefined } from '../models/ModelUtils';

/*
data class TicketEmployeeEntity (
    val employeeId: UUID
)*/

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

    const property = action.properties.find(prop => {if(prop.name === 'employee'){ return prop}})
    const href = property?.possibleValues?.href

    const url = href === undefined || null ? '' : BASE_URL_API + href 
    
    const { isFetching, isCanceled, cancel, result, error } = useFetch<Collection>(url, init)

    if (!action || !setPayload || !setAction) return null

    if (isFetching) return <Loading/>
    if (isCanceled) return <>Canceled</> //todo
    if (error) return <DisplayError/>
    console.log(result)
    
    function Filters() {

        const [directionAux, setDirectionAux] = useState(direction)
        const [sortByAux, setSortByAux] = useState(sortBy)

        return (
            <div className='flex w-full gap-4'>
                <select className='border rounded-lg' onChange={value => setSortByAux(value.target.value)}>
                    <option value='date'>Date</option>
                    <option value='name'>Name</option>
                </select>       
                <button 
                    className='bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-lg text-sm px-5 h-12 inline-flex items-center'
                    onClick= {() => { setDirectionAux(directionAux === 'desc' ? 'asc' : 'desc') }}>
                    {directionAux === 'asc' && <TbArrowBigTop style= {{ color: 'white', fontSize: '2em' }} />}
                    {directionAux === 'desc' && <TbArrowBigDown style= {{ color: 'white', fontSize: '2em' }} />}
                </button>     
                <button className='bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-lg text-sm px-5 h-12 inline-flex items-center'
                        onClick= {() => {setDirection(directionAux); setSortBy(sortByAux) }}>
                    <MdFilterList style= {{ color: 'white', fontSize: '2em' }} /> 
                </button>
            </div>    
        )
    }

    function EmployeeItem({entity}: {entity: Entity<any>}) {
        if (!entity) return null;
        const employee = entity.properties
        console.log(employee)
        return (
            <div className='flex p-5 bg-white rounded-lg border border-gray-200 shadow-md'>  
                <div className='w-full flex space-x-4'>
                    <h5 className='font-md text-gray-900'>{employee.name}</h5>
                </div>
                <div className='w-full flex justify-end' >
                    <span className='flex items-center'>{employee.currentWorks}<AiFillTool style= {{ fontSize: '1.5em' }}/></span>
                    <span className='flex items-center'>{employee.avaliation}<AiFillStar style= {{ color: 'yellow', fontSize: '1.5em' }}/></span>
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
            <Filters/>
            <p>Employee selected: {employee === undefined ? '-----' : employee?.name}</p>
            <Employees entity={getEntityOrUndefined(result?.body)}/>
            <div className='flex space-x-4'>
                <button className='w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                    onClick= {() => {setAction(action); setPayload(JSON.stringify({employeeId: employee?.id}))}}>
                    Delive work
                </button>
            </div>
        </div>
    )
}