package response

// CountResponse represents a simple count result
type CountResponse struct {
	Count int64 `json:"count"`
}

// MachineStatsResponse represents machine statistics
type MachineStatsResponse struct {
	ActiveMachines int64 `json:"active_machines"`
	TotalMachines  int64 `json:"total_machines"`
}
