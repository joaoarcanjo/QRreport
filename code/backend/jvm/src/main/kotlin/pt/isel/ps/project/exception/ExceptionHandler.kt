package pt.isel.ps.project.exception

import org.postgresql.util.PSQLException
import org.springframework.beans.TypeMismatchException
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.HttpRequestMethodNotSupportedException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.context.request.ServletWebRequest
import org.springframework.web.context.request.WebRequest
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler
import pt.isel.ps.project.exception.Errors.BadRequest.Message.MISSING_MISMATCH_REQ_BODY
import pt.isel.ps.project.exception.Errors.BadRequest.Message.Templated.MUST_HAVE_TYPE
import pt.isel.ps.project.exception.Errors.MethodNotAllowed.Message.METHOD_NOT_ALLOWED
import pt.isel.ps.project.exception.Errors.NotFound.Message.RESOURCE_DETAIL_NOT_FOUND_TEMPLATE
import pt.isel.ps.project.exception.Errors.UniqueConstraint
import pt.isel.ps.project.exception.Errors.NotFound
import pt.isel.ps.project.exception.Errors.UnknownErrorWritingResource
import pt.isel.ps.project.exception.Errors.UnknownErrorWritingResource.Message.DB_WRITE_ERROR_TEMPLATE
import pt.isel.ps.project.exception.Errors.InactiveResource
import pt.isel.ps.project.exception.Errors.InactiveResource.Message.INACTIVE_RESOURCE
import pt.isel.ps.project.exception.Errors.InactiveResource.Message.INACTIVE_RESOURCE_DETAIL
import pt.isel.ps.project.exception.Errors.InternalServerError.Message.INTERNAL_ERROR
import pt.isel.ps.project.exception.Errors.Unauthorized
import pt.isel.ps.project.exception.Errors.Unauthorized.Message.INVALID_CREDENTIALS
import pt.isel.ps.project.exception.Errors.Unauthorized.WWW_AUTH_HEADER
import pt.isel.ps.project.exception.Errors.Unauthorized.WWW_AUTH_HEADER_VALUE
import pt.isel.ps.project.exception.Errors.buildMessage
import pt.isel.ps.project.model.representations.ProblemJsonModel
import java.net.URI
import javax.servlet.http.HttpServletRequest

@ControllerAdvice
class ExceptionHandler : ResponseEntityExceptionHandler() {

    fun buildExceptionResponse(
        type: URI,
        title: String,
        instance: String,
        status: HttpStatus,
        detail: String? = null,
        data: Any? = null,
        headers: HttpHeaders = HttpHeaders(),
        invalidParameters: List<InvalidParameter>? = null,
    ): ResponseEntity<Any> {
        return ResponseEntity
            .status(status)
            .contentType(ProblemJsonModel.MEDIA_TYPE)
            .headers(headers)
            .body(ProblemJsonModel(type, title, detail, instance, invalidParameters, data))
    }

    /**
     * Function used on those exceptions that are standard, this is, set of exceptions that return always the same
     * properties, such as [NotFoundException]
     */
    @ExceptionHandler(StandardException::class)
    fun handleStandard(
        ex: StandardException,
        req: HttpServletRequest
    ): ResponseEntity<Any> = buildExceptionResponse(
        ex.type,
        ex.message,
        req.requestURI,
        ex.status,
        ex.detail,
        ex.data
    )

    @ExceptionHandler(InvalidParameterException::class)
    fun handleInvalidParameters(
        ex: InvalidParameterException,
        req: HttpServletRequest
    ): ResponseEntity<Any> = buildExceptionResponse(
        Errors.BadRequest.TYPE,
        ex.message,
        req.requestURI,
        Errors.BadRequest.STATUS,
        ex.detail,
        ex.data,
        invalidParameters = ex.invalidParameters
    )

    @ExceptionHandler(UnauthorizedException::class)
    fun handleUnauthorized(
        ex: UnauthorizedException,
        req: HttpServletRequest
    ): ResponseEntity<Any> {
        val headers = HttpHeaders()
        headers.add(WWW_AUTH_HEADER, WWW_AUTH_HEADER_VALUE)
        return buildExceptionResponse(
            Unauthorized.TYPE,
            ex.message,
            req.requestURI,
            Unauthorized.STATUS,
            ex.detail,
            ex.data,
            headers
        )
    }

    /**
     * Exception thrown on a type mismatch when trying to set a bean property. Like inserting a character in the URI
     * path when it is expected an integer.
     */
    override fun handleTypeMismatch(
        ex: TypeMismatchException,
        headers: HttpHeaders,
        status: HttpStatus,
        request: WebRequest
    ): ResponseEntity<Any> = buildExceptionResponse(
        Errors.BadRequest.TYPE,
        MISSING_MISMATCH_REQ_BODY,
        (request as ServletWebRequest).request.requestURI,
        Errors.BadRequest.STATUS,
        invalidParameters = listOf(InvalidParameter(
            (ex as MethodArgumentTypeMismatchException).name,
            Errors.BadRequest.Locations.PATH,
            buildMessage(MUST_HAVE_TYPE, ex.requiredType.toString())
        )),
    )

    override fun handleHttpRequestMethodNotSupported(
        ex: HttpRequestMethodNotSupportedException,
        headers: HttpHeaders,
        status: HttpStatus,
        request: WebRequest
    ): ResponseEntity<Any> = buildExceptionResponse(
        Errors.MethodNotAllowed.TYPE,
        METHOD_NOT_ALLOWED,
        (request as ServletWebRequest).request.requestURI,
        Errors.MethodNotAllowed.STATUS,
    )

    /**
     * Exception thrown when the request body has a missing parameter or a type mismatch.
     */
    override fun handleHttpMessageNotReadable(
        ex: HttpMessageNotReadableException,
        headers: HttpHeaders,
        status: HttpStatus,
        request: WebRequest
    ): ResponseEntity<Any> = buildExceptionResponse(
        Errors.BadRequest.TYPE,
        MISSING_MISMATCH_REQ_BODY,
        (request as ServletWebRequest).request.requestURI,
        Errors.BadRequest.STATUS,
    )

    /**
     * Handles the exceptions coming from the PostgreSQL database
     */
    @ExceptionHandler(PSQLException::class)
    private fun handleJdbiException(ex: PSQLException, request: HttpServletRequest): ResponseEntity<Any> {
        val error = ex.serverErrorMessage
        val requestUri = request.requestURI
        return when (error?.message) {
            UniqueConstraint.SQL_TYPE -> UniqueConstraint.run {
                buildExceptionResponse(
                    TYPE,
                    buildNotUniqueMessage(error.detail!!, error.hint!!),
                    requestUri,
                    STATUS,
                )
            }
            NotFound.SQL_TYPE -> NotFound.run {
                buildExceptionResponse(
                    TYPE,
                    buildMessage(RESOURCE_DETAIL_NOT_FOUND_TEMPLATE, error.detail!!),
                    requestUri,
                    STATUS,
                )
            }
            UnknownErrorWritingResource.SQL_TYPE -> UnknownErrorWritingResource.run {
                buildExceptionResponse(
                    TYPE,
                    buildMessage(DB_WRITE_ERROR_TEMPLATE, error.detail!!),
                    requestUri,
                    STATUS,
                )
            }
            InactiveResource.SQL_TYPE -> InactiveResource.run {
                buildExceptionResponse(
                    TYPE,
                    INACTIVE_RESOURCE,
                    requestUri,
                    STATUS,
                    INACTIVE_RESOURCE_DETAIL,
                )
            }
            Unauthorized.SQL_TYPE -> Unauthorized.run {
                buildExceptionResponse(
                    TYPE,
                    INVALID_CREDENTIALS,
                    requestUri,
                    STATUS,
                )
            }
            else -> Errors.InternalServerError.run {
                buildExceptionResponse(
                    TYPE,
                    INTERNAL_ERROR,
                    requestUri,
                    STATUS,
                )
            }
        }
    }
}
