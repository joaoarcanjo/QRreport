package pt.isel.ps.project.service

import org.springframework.stereotype.Service
import pt.isel.ps.project.dao.AnomalyDao
import pt.isel.ps.project.exception.Errors
import pt.isel.ps.project.exception.InternalServerException
import pt.isel.ps.project.model.anomaly.ANOMALY_REP
import pt.isel.ps.project.model.anomaly.AnomaliesDto
import pt.isel.ps.project.model.anomaly.AnomalyItemDto
import pt.isel.ps.project.model.anomaly.InputAnomalyEntity
import pt.isel.ps.project.util.Validator.Device.Anomaly.verifyAnomalyInput
import pt.isel.ps.project.util.deserializeJsonTo

@Service
class AnomalyService(val anomalyDao: AnomalyDao) {

    fun getAnomalies(deviceId: Long): AnomaliesDto {
        val a = anomalyDao.getAnomalies(deviceId)
        return a.deserializeJsonTo()
    }

    fun createAnomaly(deviceId: Long, anomaly: InputAnomalyEntity): AnomalyItemDto {
        verifyAnomalyInput(anomaly)
        return anomalyDao.createAnomaly(deviceId, anomaly).getString(ANOMALY_REP)
            ?.deserializeJsonTo()
            ?: throw InternalServerException(Errors.InternalServerError.Message.INTERNAL_ERROR)
    }

    fun updateAnomaly(deviceId: Long, anomalyId: Long, anomaly: InputAnomalyEntity): AnomalyItemDto {
        verifyAnomalyInput(anomaly)
        return anomalyDao.updateAnomaly(deviceId, anomalyId, anomaly).getString(ANOMALY_REP)
            ?.deserializeJsonTo()
            ?: throw InternalServerException(Errors.InternalServerError.Message.INTERNAL_ERROR)
    }

    fun deleteAnomaly(deviceId: Long, anomalyId: Long): AnomalyItemDto {
        return anomalyDao.deleteAnomaly(deviceId, anomalyId).getString(ANOMALY_REP)
            ?.deserializeJsonTo()
            ?: throw InternalServerException(Errors.InternalServerError.Message.INTERNAL_ERROR)
    }
}