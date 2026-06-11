namespace VesselAPI.Models;

// Simplified model used when creating or updating a Vessel
// Avoids unnecessary fields in the API request as this caused errors.
public class VesselDto
{
    public string IMO_Number { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Flag { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;

}

