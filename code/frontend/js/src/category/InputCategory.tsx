import { useForm } from "react-hook-form";
import { AiFillCloseCircle } from "react-icons/ai";
import { Form, Input, LittleSubmitButton } from "../components/form/FormComponents";
import { simpleInputForm } from "../components/form/FormInputs";
import { CloseButton } from "../components/Various";
import { Action } from "../models/QRJsonModel";

export function InputCategory({action, setAction, setAuxAction, setPayload }: {  
    action?: Action,
    setAction: React.Dispatch<React.SetStateAction<Action | undefined>> | undefined,
    setAuxAction: React.Dispatch<React.SetStateAction<Action | undefined>>
    setPayload: React.Dispatch<React.SetStateAction<string>>
}) {

    type companyData = {
        name: string
    }

    const { register, handleSubmit, formState: { errors } } = useForm<companyData>();

    if(!action || !setAction || !setAuxAction || !setPayload) return null

    const onSubmitHandler = handleSubmit(({ name }) => {
        setAction(action)
        setPayload(JSON.stringify({name: name}))
    })

    function Inputs() {
        let componentsInputs = action!!.properties.map(prop => {
            switch (prop.name) {
                case 'name': return <Input value={simpleInputForm(register, 'Name', errors, prop.required, prop.name, prop.type)}/>
            }
        })
        return <>{componentsInputs}</>
    }
    
    return (
        <div className="space-y-3 p-5 bg-white rounded-lg border border-gray-200">
            <CloseButton onClickHandler={() => setAuxAction(undefined)}/>
            <Form onSubmitHandler = { onSubmitHandler }>
                <Inputs/>
                <LittleSubmitButton text={`${action.title}`}/>
            </Form>
        </div> 
    )
}