import { useForm } from "react-hook-form";
import { AiFillCloseCircle } from "react-icons/ai";
import { Form, Input } from "../components/form/FormComponents";
import { simpleInputForm } from "../components/form/FormInputs";
import { Action } from "../models/QRJsonModel";


export function UpdateRoom({action, setAction, setAuxAction, setPayload }: {  
    action?: Action,
    setAction: React.Dispatch<React.SetStateAction<Action | undefined>> | undefined,
    setAuxAction: React.Dispatch<React.SetStateAction<Action | undefined>>
    setPayload: React.Dispatch<React.SetStateAction<string>>
}) {

    type roomData = {
        name: string
    }

    const { register, handleSubmit, formState: { errors } } = useForm<roomData>();

    if(!action || !setAction) return null

    const onSubmitHandler = handleSubmit(({ name }) => {
        setAction(action)
        setPayload(JSON.stringify({name: name}))
    })

    function Inputs() {
        let componentsInputs = action!!.properties.map(prop => {        
            switch (prop.name) {
                case 'name': return <Input value={simpleInputForm(register, errors, prop.required, prop.name, prop.type)}/>
            }
        })
        return <>{componentsInputs}</>
    }
    
    return (
        <div className="space-y-3 p-5 bg-green rounded-lg border border-gray-200">
            <button onClick={() => setAuxAction(undefined)}>
                <AiFillCloseCircle style= {{ color: '#db2a0a', fontSize: "1.4em" }}/>
            </button>
            <Form onSubmitHandler = { onSubmitHandler }>
                <Inputs/>
                <button className="text-white bg-green-500 hover:bg-green-700 rounded-lg px-2">
                    {action.title}
                </button>
            </Form>
        </div> 
    )
}