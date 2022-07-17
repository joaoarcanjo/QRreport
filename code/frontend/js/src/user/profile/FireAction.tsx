import { useForm } from "react-hook-form"
import { AiFillCloseCircle } from "react-icons/ai"
import { Form, TextArea } from "../../components/form/FormComponents"
import { simpleTextAreaForm } from "../../components/form/FormInputs"
import { ListPossibleValues } from "../../components/form/ListPossibleValues"
import { Action } from "../../models/QRJsonModel"

export function FireAction({ action, setAction, setAuxInfo, setAuxAction }: { 
    action: Action,
    setAction: React.Dispatch<React.SetStateAction<Action | undefined>>,
    setAuxInfo: React.Dispatch<React.SetStateAction<string>>,
    setAuxAction: React.Dispatch<React.SetStateAction<Action | undefined>>,
}) {
    type roleData = { 
        company: number,
        reason: string 
    }

    const { register, handleSubmit, formState: { errors } } = useForm<roleData>()

    const onSubmitHandler = handleSubmit(({ company, reason }) => {
        action.href = action.href.replace('{companyId}', company.toString())
        setAction(action)
        setAuxInfo(JSON.stringify({reason: reason}))
    })
    
    function Inputs() {
        let componentsInputs = action.properties.map(prop => {
            switch (prop.name) {
                case 'company': return <ListPossibleValues 
                    register={register} regName={prop.name} href={prop.possibleValues?.href} listText={'Select company'}/>
                case 'reason': return <TextArea value={simpleTextAreaForm(register, errors, prop.required,  prop.name, 'Insert the reason')}/>
            }
        })
        return <>{componentsInputs}</>
    }

    return (
        <div className="space-y-3 p-5 bg-green rounded-lg border border-gray-200 shadow-md">
            <button onClick={() => setAuxAction(undefined)}>
                <AiFillCloseCircle style= {{ color: '#db2a0a', fontSize: "1.4em" }}/>
            </button>
            <Form onSubmitHandler = { onSubmitHandler }>
                <Inputs/>
                <button
                    className="text-white bg-blue-700 hover:bg-blue-800 rounded-lg px-2">
                        {action.title}
                </button>
            </Form>
        </div>)
}