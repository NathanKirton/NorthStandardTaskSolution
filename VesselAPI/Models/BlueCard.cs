// This model represents a bluecard in the system.
// Maps to the Azure Database.
namespace VesselAPI.Models;

public class BlueCard
{
    public int BlueCardId { get; set; } //PK in database.
    public int VesselId { get; set; } //FK to Vessel model.
    public DateTime IssuedDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public string DocumentUrl { get; set; } = string.Empty;
    public string Insurer { get; set; } = string.Empty;
    public DateTime LastUpdated { get; set; }
    public Vessel? Vessel { get; set; }
}