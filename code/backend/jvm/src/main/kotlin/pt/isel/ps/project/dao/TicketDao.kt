package pt.isel.ps.project.dao

import org.jdbi.v3.core.statement.OutParameters
import org.jdbi.v3.core.transaction.TransactionIsolationLevel
import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.customizer.OutParameter
import org.jdbi.v3.sqlobject.statement.SqlCall
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.transaction.Transaction
import pt.isel.ps.project.model.ticket.TICKET_REP
import pt.isel.ps.project.model.ticket.CreateTicketEntity
import pt.isel.ps.project.model.ticket.UpdateTicketEntity
import pt.isel.ps.project.model.ticket.ChangeTicketStateEntity
import pt.isel.ps.project.model.ticket.TicketRateEntity
import pt.isel.ps.project.model.ticket.TicketEmployeeEntity
import pt.isel.ps.project.responses.PersonResponses.PERSON_PAGE_MAX_SIZE
import pt.isel.ps.project.responses.TicketResponses.STATES_PAGE_MAX_SIZE
import pt.isel.ps.project.responses.TicketResponses.TICKET_PAGE_MAX_SIZE
import java.util.*

interface TicketDao {
    @Transaction(TransactionIsolationLevel.SERIALIZABLE)
    @SqlQuery("SELECT get_tickets(:personId, :company, :building, $TICKET_PAGE_MAX_SIZE, :skip, :sort_by, :direction, :state);")
    fun getTickets(personId: UUID, company: Long?, building: Long?, direction: String, sort_by: String, skip: Int, state: Int?): String

    @Transaction(TransactionIsolationLevel.SERIALIZABLE)
    @SqlQuery("SELECT get_ticket(:ticketId, :personId, 10, 0);")
    fun getTicket(ticketId: Long, personId: UUID): String

    @Transaction(TransactionIsolationLevel.REPEATABLE_READ)
    @SqlCall("CALL create_ticket(:$TICKET_REP, :hash, :subject, :description, :name, :email, :phone);")
    @OutParameter(name = TICKET_REP, sqlType = java.sql.Types.OTHER)
    fun createTicket(@BindBean ticket: CreateTicketEntity): OutParameters

    @Transaction(TransactionIsolationLevel.REPEATABLE_READ)
    @OutParameter(name = TICKET_REP, sqlType = java.sql.Types.OTHER)
    @SqlCall("CALL update_ticket(:$TICKET_REP, :ticketId, :personId, :subject, :description);")
    fun updateTicket(ticketId: Long, personId: UUID, @BindBean ticket: UpdateTicketEntity): OutParameters

    @Transaction(TransactionIsolationLevel.REPEATABLE_READ)
    @OutParameter(name = TICKET_REP, sqlType = java.sql.Types.OTHER)
    @SqlCall("CALL change_ticket_state(:$TICKET_REP, :ticketId, :personId, :state);")
    fun changeTicketState(ticketId: Long, personId: UUID, @BindBean ticket: ChangeTicketStateEntity): OutParameters

    @Transaction(TransactionIsolationLevel.REPEATABLE_READ)
    @OutParameter(name = TICKET_REP, sqlType = java.sql.Types.OTHER)
    @SqlCall("CALL add_ticket_rate(:$TICKET_REP, :ticketId, :personId, :rate);")
    fun addTicketRate(ticketId: Long, personId: UUID, @BindBean rate: TicketRateEntity): OutParameters

    @Transaction(TransactionIsolationLevel.SERIALIZABLE)
    @SqlQuery("SELECT get_specific_employees(:ticketId, $PERSON_PAGE_MAX_SIZE, :skip);")
    fun getSpecificEmployees(ticketId: Long, skip: Int): String

    @Transaction(TransactionIsolationLevel.REPEATABLE_READ)
    @OutParameter(name = TICKET_REP, sqlType = java.sql.Types.OTHER)
    @SqlCall("CALL set_ticket_employee(:$TICKET_REP, :personId, :employeeId, :ticketId);")
    fun setEmployee(ticketId: Long, personId: UUID, @BindBean employee: TicketEmployeeEntity): OutParameters

    @Transaction(TransactionIsolationLevel.REPEATABLE_READ)
    @OutParameter(name = TICKET_REP, sqlType = java.sql.Types.OTHER)
    @SqlCall("CALL remove_ticket_employee(:$TICKET_REP, :ticketId, :personId);")
    fun removeEmployee(ticketId: Long, personId: UUID): OutParameters

    @Transaction(TransactionIsolationLevel.REPEATABLE_READ)
    @OutParameter(name = TICKET_REP, sqlType = java.sql.Types.OTHER)
    @SqlCall("CALL group_ticket(:$TICKET_REP, :ticketId, :parentTicket, :personId);")
    fun groupTicket(ticketId: Long, parentTicket: Long, personId: UUID): OutParameters

    @Transaction(TransactionIsolationLevel.SERIALIZABLE)
    @SqlQuery("SELECT get_employee_states($STATES_PAGE_MAX_SIZE, :skip);")
    fun getEmployeeStates(skip: Int): String
}