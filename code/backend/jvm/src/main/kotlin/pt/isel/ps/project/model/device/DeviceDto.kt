package pt.isel.ps.project.model.device

import pt.isel.ps.project.model.anomaly.AnomaliesDto
import java.sql.Timestamp

data class DeviceItemDto (
    val id: Long,
    val name: String,
    val category: String,
    val state: String,
    val timestamp: Timestamp?,
)

data class DeviceDto (
    var device: DeviceItemDto,
    val anomalies: AnomaliesDto
)

data class DeviceQrCodeDto (
    val device: DeviceItemDto,
    val hash: String?, //is null when the device doesn't have any qrcode generated by the user.
)

data class DevicesDto (
    val devices: List<DeviceItemDto>?,
    val devicesCollectionSize: Int,
)