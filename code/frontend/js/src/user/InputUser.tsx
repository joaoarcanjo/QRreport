import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AiFillCloseCircle } from "react-icons/ai";
import { SelectCategory } from "../category/SelectCategory";
import { Input, InputProps } from "../components/form/FormComponents";
import { emailInputForm, passwordInputForm, passwordVerifyInputForm, phoneInputForm, simpleInputForm } from "../components/form/FormInputs";
import { ListPossibleValues } from "../components/form/ListPossibleValues";
import { CloseButton } from "../components/Various";
import { Category, Company, Role } from "../models/Models";
import { Action, Property } from "../models/QRJsonModel";
import { SelectUserCompany } from "./profile/SelectUserCompany";
import { EMPLOYEE_ROLE, MANAGER_ROLE } from "./Session";

export function InputUser({action, setAction, setAuxAction, setPayload }: {  
    action: Action,
    setAction: React.Dispatch<React.SetStateAction<Action | undefined>>,
    setAuxAction: React.Dispatch<React.SetStateAction<Action | undefined>>
    setPayload: React.Dispatch<React.SetStateAction<string>>
}) {

    type companyData = {
        name: string,
        phone: string,
        email: string,
        password: string,
        passwordVerify: string,
        role: string
    }

    const { register, getValues, handleSubmit, formState: { errors } } = useForm<companyData>();
    const [ company, setCompany ] = useState<Company>();
    const [ skill, setSkill ] = useState<Category>();
    const [currentRole, setRole ] = useState<string>('')

    const onSubmitHandler = handleSubmit(({ name, phone, email, password, passwordVerify, role }) => {
        const payload: any = {}

        if(role === MANAGER_ROLE && !company) return
        if(role === EMPLOYEE_ROLE && (!company || !skill)) return

        payload['name'] = name 
        payload['email'] = email 
        payload['phone'] = phone !== '' ? phone : null
        payload['password'] = password !== '' ? password : null
        payload['passwordVerify'] = passwordVerify !== '' ? passwordVerify : null
        payload['role'] = role
        payload['company'] = company === undefined ? null : company.id
        payload['skill'] = skill === undefined ? null : skill.id
        
        setAction(action)
        setPayload(JSON.stringify(payload))
    })
    
    const selectCompany = useMemo(() => {
        return <SelectUserCompany action={action} setPayload={setCompany} setAction={undefined} setAuxAction={undefined} />
    },[action])

    const selectSkill = useMemo(() => {
        return <SelectCategory action={action} propName={'skill'} setPayload={setSkill} setAuxAction={undefined} />
    },[action])

    const selectRole = useMemo(() => {
        const prop = (action.properties.find(prop => prop.name === 'role'))
        return <ListPossibleValues 
        register={register} regName={prop!.name} href={prop!.possibleValues?.href} listText={'Select role'} setValue={setRole}/>

    },[action])

    function Inputs() {
        let componentsInputs = action!!.properties.map((prop, idx) => {
            switch (prop.name) {
                case 'name': return <Input key={idx} value={simpleInputForm(register, 'Name', errors, prop.required, prop.name, prop.type)}/>
                case 'phone': return <Input key={idx} value={phoneInputForm(register, errors, prop.required, prop.name)}/>
                case 'email': return <Input key={idx} value={emailInputForm(register, errors, prop.required, prop.name)}/>
                case 'password': return (
                    <div key={idx}>
                        <Input key={idx} value={passwordInputForm(register, errors, prop.required, prop.name)}/>
                        <Input key={'password verify'} value={passwordVerifyInputForm(register, errors, getValues, prop.required)}/>
                    </div>)
            }
        })
        return <>{componentsInputs}</>
    }
    
    return (
        <div className="space-y-3 p-5 bg-white rounded-lg border border-gray-200">
            <CloseButton onClickHandler={() => setAuxAction(undefined)}/>
            <Inputs/>
            {selectRole}
            {(currentRole === EMPLOYEE_ROLE || currentRole === MANAGER_ROLE) && <p>Selected company: {company?.name}</p>}
            {company && <button className={'flex space-x-1 px-1 py-1 text-xs text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800'} onClick={() => {setCompany(undefined)}}>
                <div>Remove</div>
                <div><AiFillCloseCircle style= {{ color: '#db2a0a', fontSize: "1.4em" }}/></div>
            </button>}
            {(currentRole === EMPLOYEE_ROLE || currentRole === MANAGER_ROLE) && selectCompany}
            {currentRole === EMPLOYEE_ROLE && <p>Selected skill: {skill?.name}</p>}
            {skill && <button className={'flex space-x-1 px-1 py-1 text-xs text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800'} onClick={() => {setSkill(undefined)}}>
                <div>Remove</div>
                <div><AiFillCloseCircle style= {{ color: '#db2a0a', fontSize: "1.4em" }}/></div>
            </button>}
            {currentRole === EMPLOYEE_ROLE && <div>{selectSkill}</div>}
            <button className='w-full bg-green-400 hover:bg-green-600 text-white font-bold rounded-lg text-sm px-2 h-8 content-center' onClick= {onSubmitHandler}>
                Create person
            </button>
        </div> 
    )
}