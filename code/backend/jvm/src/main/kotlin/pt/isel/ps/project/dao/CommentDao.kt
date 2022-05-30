package pt.isel.ps.project.dao

import org.jdbi.v3.core.statement.OutParameters
import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.customizer.OutParameter
import org.jdbi.v3.sqlobject.statement.SqlCall
import org.jdbi.v3.sqlobject.statement.SqlQuery
import pt.isel.ps.project.model.comment.COMMENT_REP
import pt.isel.ps.project.model.comment.InputCommentEntity

interface CommentDao {

    @SqlQuery("SELECT get_comments(:ticketId, null, null, null);")
    fun getComments(ticketId: Long): String

    @SqlQuery("SELECT get_comment(:commentId, :ticketId);")
    fun getComment(ticketId: Long, commentId: Long): String

    @OutParameter(name = COMMENT_REP, sqlType = java.sql.Types.OTHER)
    @SqlCall("CALL create_comment('0a8b83ec-7675-4467-91e5-33e933441eee', :ticketId, :comment, :$COMMENT_REP);")
    fun createComment(ticketId: Long, @BindBean comment: InputCommentEntity): OutParameters

    @OutParameter(name = COMMENT_REP, sqlType = java.sql.Types.OTHER)
    @SqlCall("CALL update_comment(:commentId, :ticketId, :comment, :$COMMENT_REP);")
    fun updateComment(commentId: Long, ticketId: Long, @BindBean comment: InputCommentEntity): OutParameters

    @OutParameter(name = COMMENT_REP, sqlType = java.sql.Types.OTHER)
    @SqlCall("CALL delete_comment(:ticketId, :commentId, :$COMMENT_REP);")
    fun deleteComment(ticketId: Long, commentId: Long): OutParameters

}