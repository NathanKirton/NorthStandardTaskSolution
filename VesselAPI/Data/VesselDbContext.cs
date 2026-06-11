// Bridges application to the Azure Database.
// Entity Framework uses this class to query and save data.
using Microsoft.EntityFrameworkCore;
using VesselAPI.Models;

namespace VesselAPI.Data;

public class VesselDbContext : DbContext
{
    // Constructor that receives database configuration options.
    // Options are passed in from Program.cs when the app starts.
    public VesselDbContext(DbContextOptions<VesselDbContext> options) : base(options) { }

    // Represents Vessels and BlueCard .
    public DbSet<Vessel> Vessels { get; set; }
    public DbSet<BlueCard> BlueCards { get; set; }
}