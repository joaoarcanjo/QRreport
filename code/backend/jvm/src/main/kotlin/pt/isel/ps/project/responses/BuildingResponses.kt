package pt.isel.ps.project.responses

import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import pt.isel.ps.project.auth.AuthPerson
import pt.isel.ps.project.model.Uris
import pt.isel.ps.project.model.Uris.Companies.Buildings
import pt.isel.ps.project.model.Uris.Companies.Buildings.BUILDINGS_PAGINATION
import pt.isel.ps.project.model.building.BuildingDto
import pt.isel.ps.project.model.building.BuildingItemDto
import pt.isel.ps.project.model.building.BuildingManagerDto
import pt.isel.ps.project.model.building.BuildingsDto
import pt.isel.ps.project.model.person.Roles
import pt.isel.ps.project.model.representations.CollectionModel
import pt.isel.ps.project.model.representations.DEFAULT_PAGE
import pt.isel.ps.project.model.representations.QRreportJsonModel
import pt.isel.ps.project.responses.PersonResponses.getPersonItem
import pt.isel.ps.project.responses.Response.Classes
import pt.isel.ps.project.responses.Response.Links
import pt.isel.ps.project.responses.Response.Relations
import pt.isel.ps.project.responses.Response.buildResponse
import pt.isel.ps.project.responses.Response.setLocationHeader
import pt.isel.ps.project.responses.RoomResponses.ROOM_PAGE_MAX_SIZE
import pt.isel.ps.project.responses.RoomResponses.getRoomsRepresentation
import pt.isel.ps.project.util.Validator.Auth.Roles.isAdmin
import pt.isel.ps.project.util.Validator.Auth.Roles.isManager
import pt.isel.ps.project.util.Validator.Auth.States.isActive
import pt.isel.ps.project.util.Validator.Auth.States.isInactive

object BuildingResponses {
    const val BUILDING_PAGE_MAX_SIZE = 10

    object Actions {
        fun createBuilding(companyId: Long) = QRreportJsonModel.Action(
            name = "create-building",
            title = "Create building",
            method = HttpMethod.POST,
            href = Buildings.makeBase(companyId),
            type = MediaType.APPLICATION_JSON.toString(),
            properties = listOf(
                QRreportJsonModel.Property("name", "string"),
                QRreportJsonModel.Property("floors", "number"),
                QRreportJsonModel.Property("managerId", "string",
                    possibleValues = QRreportJsonModel.PropertyValue(
                        Uris.Persons.personsSelf(DEFAULT_PAGE, companyId, Roles.MANAGER))))
            )

        fun updateBuilding(companyId: Long, buildingId: Long) = QRreportJsonModel.Action(
            name = "update-building",
            title = "Update building",
            method = HttpMethod.PUT,
            href = Buildings.makeSpecific(companyId, buildingId),
            type = MediaType.APPLICATION_JSON.toString(),
            properties = listOf(
                QRreportJsonModel.Property("name", "string", required = false),
                QRreportJsonModel.Property("floors", "number", required = false)
            )
        )

        fun activateBuilding(companyId: Long, buildingId: Long) = QRreportJsonModel.Action(
            name = "activate-building",
            title = "Activate building",
            method = HttpMethod.POST,
            href = Buildings.makeActivate(companyId, buildingId)
        )

        fun deactivateBuilding(companyId: Long, buildingId: Long) = QRreportJsonModel.Action(
            name = "deactivate-building",
            title = "Deactivate building",
            method = HttpMethod.POST,
            href = Buildings.makeDeactivate(companyId, buildingId)
        )

        fun changeBuildingManager(companyId: Long, buildingId: Long) = QRreportJsonModel.Action(
            name = "change-building-manager",
            title = "Change building manager",
            method = HttpMethod.PUT,
            href = Buildings.makeManager(companyId, buildingId),
            type = MediaType.APPLICATION_JSON.toString(),
            properties = listOf(QRreportJsonModel.Property("managerId", "string",
                possibleValues = QRreportJsonModel.PropertyValue(
                    Uris.Persons.personsSelf(DEFAULT_PAGE, companyId, Roles.MANAGER))))
        )
    }

    fun getBuildingItem (companyId: Long, building: BuildingItemDto, rel: List<String>?) = QRreportJsonModel(
        clazz = listOf(Classes.BUILDING),
        rel = rel,
        properties = building,
        links = listOf(Links.self(Buildings.makeSpecific(companyId, building.id)))
    )

    fun getBuildingsRepresentation(
        user: AuthPerson,
        buildingsDto: BuildingsDto,
        companyId: Long,
        page: Int,
        rel: List<String>?
    ) = QRreportJsonModel(
        clazz = listOf(Classes.BUILDING, Classes.COLLECTION),
        rel = rel,
        properties = CollectionModel(page, BUILDING_PAGE_MAX_SIZE, buildingsDto.buildingsCollectionSize),
        entities = mutableListOf<QRreportJsonModel>().apply {
            if (buildingsDto.buildings != null) addAll(buildingsDto.buildings.map {
                getBuildingItem(companyId, it, listOf(Relations.ITEM))
            })
        },
        actions = mutableListOf<QRreportJsonModel.Action>().apply {
            if(isActive(buildingsDto.companyState) && (isAdmin(user) || isManager(user)))
                add(Actions.createBuilding(companyId))
        },
        links = listOf(
            Links.self(Uris.makePagination(page, Buildings.makeBase(companyId))),
            Links.pagination(BUILDINGS_PAGINATION),
        )
    )

    fun createBuildingRepresentation(companyId: Long, building: BuildingItemDto) = buildResponse(
        QRreportJsonModel(
            clazz = listOf(Classes.BUILDING),
            properties = building,
            links = listOf(Links.self(Buildings.makeSpecific(companyId, building.id)))
        ),
        HttpStatus.CREATED,
        setLocationHeader(Buildings.makeSpecific(companyId, building.id))
    )

    fun getBuildingRepresentation(user: AuthPerson, companyId: Long, buildingDto: BuildingDto): ResponseEntity<QRreportJsonModel> {
        val building = buildingDto.building
        return buildResponse(QRreportJsonModel(
            clazz = listOf(Classes.BUILDING),
            properties = building,
            entities = mutableListOf<QRreportJsonModel>().apply {
                add(getRoomsRepresentation(user, companyId, building.id, buildingDto.rooms, DEFAULT_PAGE, listOf(Relations.BUILDING_ROOMS)))
                add(getPersonItem(buildingDto.manager, listOf(Relations.BUILDING_MANAGER)))
            },
            actions = mutableListOf<QRreportJsonModel.Action>().apply {
                if (isInactive(buildingDto.building.state))
                    add(Actions.activateBuilding(companyId, building.id))
                else {
                    if (isAdmin(user)) {
                        add(Actions.deactivateBuilding(companyId, building.id))
                        add(Actions.updateBuilding(companyId, building.id))
                        add(Actions.changeBuildingManager(companyId, building.id))
                    }
                }
            },
            links = listOf(
                Links.self(Buildings.makeSpecific(companyId, building.id)),
            )
        ))
    }

    fun updateBuildingRepresentation(companyId: Long, building: BuildingItemDto) = buildResponse(
        QRreportJsonModel(
            clazz = listOf(Classes.BUILDING),
            properties = building,
            links = listOf(Links.self(Buildings.makeSpecific(companyId, building.id)))
        )
    )

    fun deactivateActivateBuildingRepresentation(companyId: Long, building: BuildingItemDto) = buildResponse(
        QRreportJsonModel(
            clazz = listOf(Classes.BUILDING),
            properties = building,
            links = listOf(
                Links.self(Buildings.makeSpecific(companyId, building.id)),
                Links.company(companyId)
            )
        )
    )

    fun changeBuildingManagerRepresentation(companyId: Long, buildingManager: BuildingManagerDto) = buildResponse(
        QRreportJsonModel(
            clazz = listOf(Classes.BUILDING),
            properties = buildingManager,
            links = listOf(Links.self(Buildings.makeSpecific(companyId, buildingManager.id)))
        )
    )
}