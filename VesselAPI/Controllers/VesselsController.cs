//This controller handes requests related to vessels.
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VesselAPI.Data;
using VesselAPI.Models;

namespace VesselAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VesselsController : ControllerBase
{
    private readonly VesselDbContext _context; //Database context for accessing vessel data.

    public VesselsController(VesselDbContext context) //Injects the database context through the constructor and entity framework.
    {
        _context = context;
    }



    [HttpGet] //This endpoint returns a list of all vessels, including their associated bluecards.

    public async Task<ActionResult<IEnumerable<Vessel>>> GetVessels() 
    {
        return await _context.Vessels.Include(v => v.BlueCards).ToListAsync();
    }



    [HttpGet("{id}")] //This endpoint returns a single vessel based on ID, including its associated bluecards.
    public async Task<ActionResult<Vessel>> GetVessel(int id)
    {
        var vessel = await _context.Vessels.Include(v => v.BlueCards)
                                           .FirstOrDefaultAsync(v => v.VesselId == id);
        if (vessel == null) return NotFound();
        return vessel;
    }



[HttpPost] // Creates a new vessel record in the database and sets LastUpdated timestamp
public async Task<ActionResult<Vessel>> CreateVessel(VesselDto dto)
{
    var vessel = new Vessel
    {
        IMO_Number = dto.IMO_Number,
        Name = dto.Name,
        Flag = dto.Flag,
        Owner = dto.Owner,
        Status = dto.Status,
        LastUpdated = DateTime.UtcNow
    };

    _context.Vessels.Add(vessel);
    await _context.SaveChangesAsync();
    return CreatedAtAction(nameof(GetVessel), new { id = vessel.VesselId }, vessel);
}





    [HttpPut("{id}")] //Updating a single vessel based on ID.
    public async Task<IActionResult> UpdateVessel(int id, VesselDto dto)
{
    var vessel = await _context.Vessels.FindAsync(id);
    
    if (vessel == null) return NotFound();

    vessel.IMO_Number = dto.IMO_Number;
    vessel.Name = dto.Name;
    vessel.Flag = dto.Flag;
    vessel.Owner = dto.Owner;
    vessel.Status = dto.Status;
    vessel.LastUpdated = DateTime.UtcNow;

    await _context.SaveChangesAsync();
    return NoContent();
}

    

    [HttpDelete("{id}")] //Deletes a single vessel based on ID.
    public async Task<IActionResult> DeleteVessel(int id)
    {
        var vessel = await _context.Vessels.FindAsync(id);
        if (vessel == null) return NotFound();
        _context.Vessels.Remove(vessel);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}