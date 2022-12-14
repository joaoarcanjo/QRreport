package pt.isel.ps.project.responses

import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import pt.isel.ps.project.auth.AuthPerson
import pt.isel.ps.project.model.Uris
import pt.isel.ps.project.model.building.BuildingsDto
import pt.isel.ps.project.model.company.CompaniesDto
import pt.isel.ps.project.model.company.CompanyDto
import pt.isel.ps.project.model.company.CompanyItemDto
import pt.isel.ps.project.model.company.removeBuildings
import pt.isel.ps.project.model.representations.CollectionModel
import pt.isel.ps.project.model.representations.DEFAULT_PAGE
import pt.isel.ps.project.model.representations.QRreportJsonModel
import pt.isel.ps.project.responses.BuildingResponses.BUILDING_PAGE_MAX_SIZE
import pt.isel.ps.project.responses.BuildingResponses.getBuildingsRepresentation
import pt.isel.ps.project.responses.Response.Classes
import pt.isel.ps.project.responses.Response.Links
import pt.isel.ps.project.responses.Response.Relations
import pt.isel.ps.project.responses.Response.buildResponse
import pt.isel.ps.project.responses.Response.setLocationHeader
import pt.isel.ps.project.util.Validator.Auth.Roles.isAdmin
import pt.isel.ps.project.util.Validator.Auth.States.isInactive
import java.util.*

object CompanyResponses {
    const val COMPANY_PAGE_MAX_SIZE = 10

    object Actions {
        fun createCompany() = QRreportJsonModel.Action(
            name = "create-company",
            title = "Create company",
            method = HttpMethod.POST,
            href = Uris.Companies.BASE_PATH,
            type = MediaType.APPLICATION_JSON.toString(),
            properties = listOf(
                QRreportJsonModel.Property(name = "name", type = "string"),
            )
        )

        fun updateCompany(companyId: Long) = QRreportJsonModel.Action(
            name = "update-company",
            title = "Update company",
            method = HttpMethod.PUT,
            href = Uris.Companies.makeSpecific(companyId),
            type = MediaType.APPLICATION_JSON.toString(),
            properties = listOf(
                QRreportJsonModel.Property(name = "name", type = "string"),
            )
        )

        fun deactivateCompany(companyId: Long) = QRreportJsonModel.Action(
            name = "deactivate-company",
            title = "Deactivate company",
            method = HttpMethod.POST,
            href = Uris.Companies.makeDeactivate(companyId)
        )

        fun activateCompany(companyId: Long) = QRreportJsonModel.Action(
            name = "activate-company",
            title = "Activate company",
            method = HttpMethod.POST,
            href = Uris.Companies.makeActivate(companyId)
        )
    }

    fun getCompanyItem(company: CompanyItemDto, rel: List<String>?) = QRreportJsonModel(
        clazz = listOf(Classes.COMPANY),
        rel = rel,
        properties = company,
        links = listOf(Links.self(Uris.Companies.makeSpecific(company.id))),
    )

    fun getCompaniesRepresentation(
        user: AuthPerson,
        companiesDto: CompaniesDto,
        userId: UUID?,
        state: String,
        assign: Boolean,
        collection: CollectionModel) = buildResponse(

        QRreportJsonModel(
            clazz = listOf(Classes.COMPANY, Classes.COLLECTION),
            properties = collection,
            entities = mutableListOf<QRreportJsonModel>().apply {
                if (companiesDto.companies != null)
                    addAll(companiesDto.companies.map { getCompanyItem(it, listOf(Relations.ITEM)) })
            },
            actions = mutableListOf<QRreportJsonModel.Action>().apply {
                if (isAdmin(user)) add(Actions.createCompany())
            },
            links = listOf(
                QRreportJsonModel.Link(listOf(Relations.SELF), Uris.Companies.companiesSelf(collection.pageIndex, userId, state, assign)),
                QRreportJsonModel.Link(listOf(Relations.PAGINATION), Uris.Companies.companiesPagination(userId, state, assign), templated = true)
            )
        )
    )

    fun createCompanyRepresentation(company: CompanyItemDto) = buildResponse(
        QRreportJsonModel(
            clazz = listOf(Classes.COMPANY),
            properties = company,
            links = listOf(Links.self(Uris.Companies.makeSpecific(company.id))),
        ),
        HttpStatus.CREATED,
        setLocationHeader(Uris.Companies.makeSpecific(company.id)),
    )

    fun getCompanyRepresentation(user: AuthPerson, company: CompanyDto) = buildResponse(
        QRreportJsonModel(
            clazz = listOf(Classes.COMPANY),
            properties = company.removeBuildings(),
            entities = mutableListOf<QRreportJsonModel>().apply {
                if (company.buildings != null)
                    add(getBuildingsRepresentation(
                        user,
                        company.buildings,
                        company.id,
                        DEFAULT_PAGE,
                        listOf(Relations.COMPANY_BUILDINGS)
                    ))
            },
            actions = mutableListOf<QRreportJsonModel.Action>().apply {
                if (isAdmin(user)) {
                    if (isInactive(company.state))
                        add(Actions.activateCompany(company.id))
                    else {
                        add(Actions.deactivateCompany(company.id))
                        add(Actions.updateCompany(company.id))
                    }
                }
            },
            links = listOf(
                Links.self(Uris.Companies.makeSpecific(company.id)),
                Links.companies(),
            ),
        )
    )

    fun updateCompanyRepresentation(company: CompanyItemDto) = buildResponse(
        QRreportJsonModel(
            clazz = listOf(Classes.COMPANY),
            properties = company,
            links = listOf(Links.self(Uris.Companies.makeSpecific(company.id))),
        )
    )

    fun deactivateActivateCompanyRepresentation(company: CompanyItemDto) = buildResponse(
        QRreportJsonModel(
            clazz = listOf(Classes.COMPANY),
            properties = company,
            links = listOf(
                Links.self(Uris.Companies.makeSpecific(company.id)),
                Links.companies(),
            ),
        )
    )
}
