export const BASE_URL_API = "http://localhost:8080"

export const PERSONS_URL_API = "/v1/persons"

export const PERSON_URL_API = (personId: string | undefined): string => {
    return `/v1/persons/${personId}`
}

export const TICKETS_URL_API = (sortBy: string, direction: string): string => {
    let url = BASE_URL_API + `/v1/tickets?sort_by=${sortBy}&direction=${direction}`
    return url
}

export const BASE_URL = "http://localhost:3000"

export const PERSONS_URL = "/persons"

export const PERSON_URL = (personId: string | undefined): string => {
    return `/persons/${personId}`
}