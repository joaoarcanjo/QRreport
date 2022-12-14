import { FetchResult } from "../hooks/useFetch"
import * as QrJson from "./QRJsonModel"

export function getEntityOrUndefined<T>(result?: FetchResult<T>): QrJson.Entity<T> | undefined {
    switch (result?.type) {
        case 'success': return result.entity
        case 'problem': return undefined
    }
}

export function getPropertiesOrUndefined<T>(result?: FetchResult<T>): T | undefined {
    switch (result?.type) {
        case 'success': return result.entity.properties
        case 'problem': return undefined
    }
}

export function getEntitiesOrUndefined<T>(result?: FetchResult<any>): QrJson.Entity<any>[] | undefined {
    switch (result?.type) {
        case 'success': return result.entity.entities
        case 'problem': return undefined
    }
}

export function getSpecificEntity<T>(classes: string[], rel: string, entities?: QrJson.Entity<T>[]): QrJson.Entity<T> | undefined {
    return entities!!.find(entity => {
        classes.forEach(c => {if(!entity.class.includes(c)) return undefined;})
        if(entity.rel?.includes(rel)) return entity
    })
} 

export function getActionsOrUndefined<T>(result?: FetchResult<T>): QrJson.Action[] | undefined {
    switch (result?.type) {
        case 'success': return result.entity.actions
        case 'problem': return undefined
    }
}

export function getAction<T>(actionName: string, result?: FetchResult<T>): QrJson.Action | undefined {
    const entity = getEntityOrUndefined(result)
    return entity?.actions?.find(action => action.name === actionName)
}

export function getProblemOrUndefined<T>(result?: FetchResult<T>) {
    switch (result?.type) {
        case 'success': return undefined
        case 'problem': return result.problem
    }
}

export function getLinks<T>(result?: FetchResult<T>): QrJson.Link[] | undefined {
    const entity = getEntityOrUndefined(result)
    return entity?.links
}

export function getLink<T>(linkRel: string, result?: FetchResult<T>): QrJson.Link | undefined {
    const entity = getEntityOrUndefined(result)
    return entity?.links?.find(link => link.rel.find(rel => rel === linkRel))
}

export function getEntityLink<T>(linkRel: string, entity?: QrJson.Entity<T>): QrJson.Link | undefined {
    return entity?.links?.find(link => link.rel.includes(linkRel));
}