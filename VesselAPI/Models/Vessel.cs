// This model represents a vessel in the system.
// It maps directly to the Azure Database.
namespace VesselAPI.Models;

public class Vessel
{
    public int VesselId { get; set; } //PK In databse.
    public string IMO_Number { get; set; } = string.Empty; // A getter will access the value and a setter will assign a value. The default value is an empty string.
    public string Name { get; set; } = string.Empty;
    public string Flag { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime LastUpdated { get; set; }
    public ICollection<BlueCard> BlueCards { get; set; } = new List<BlueCard>(); //This is how i create a relationship between the vessel and bluecard models. A vessel can have multiple bluecards, but a bluecard can only be associated with one vessel. This is represented by the ICollection<BlueCard> property.
}