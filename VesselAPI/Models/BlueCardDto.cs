namespace VesselAPI.Models;

// Simplified model used when creating or updating a BlueCard
// Avoids unnecessary fields in the API request as this caused errors.
public class BlueCardDto
{
    public int VesselId { get; set; }
    public DateTime IssuedDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public string DocumentUrl { get; set; } = string.Empty;
    public string Insurer { get; set; } = string.Empty;
}

