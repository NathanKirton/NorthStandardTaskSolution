//This controller handles all requests for BlueCard data.
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VesselAPI.Data;
using VesselAPI.Models;

namespace VesselAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlueCardsController : ControllerBase
{
    private readonly VesselDbContext _context; //Context used to access BlueCard data in the database.

    public BlueCardsController(VesselDbContext context) //Injects database context through constructor.
    {
        _context = context;
    }

    [HttpGet] //This endpoint returns a list of all bluecards, including their associated vessel information.
    public async Task<ActionResult<IEnumerable<BlueCard>>> GetBlueCards()
    {
        return await _context.BlueCards.Include(b => b.Vessel).ToListAsync();
    }

    

    [HttpGet("{id}")] //This endpoint returns a single bluecard based on ID, including its associated vessel information.
    public async Task<ActionResult<BlueCard>> GetBlueCard(int id)
    {
        var blueCard = await _context.BlueCards.Include(b => b.Vessel)
                                               .FirstOrDefaultAsync(b => b.BlueCardId == id);
        if (blueCard == null) return NotFound();
        return blueCard;
    }


    
    [HttpPost] //This endpoint creates a new bluecard record in the database and updates the LastUpdated timestamp.
    public async Task<ActionResult<BlueCard>> CreateBlueCard(BlueCardDto dto)
{
    var blueCard = new BlueCard
    {
        VesselId = dto.VesselId,
        IssuedDate = dto.IssuedDate,
        ExpiryDate = dto.ExpiryDate,
        DocumentUrl = dto.DocumentUrl,
        Insurer = dto.Insurer,
        LastUpdated = DateTime.UtcNow
    };

    _context.BlueCards.Add(blueCard);
    await _context.SaveChangesAsync();
    return CreatedAtAction(nameof(GetBlueCard), new { id = blueCard.BlueCardId }, blueCard);
}



    [HttpPut("{id}")] //This endpoint updates an existing bluecard record based on ID and updates the LastUpdated timestamp.
    public async Task<IActionResult> UpdateBlueCard(int id, BlueCardDto dto)
{
    var blueCard = await _context.BlueCards.FindAsync(id);
    
    if (blueCard == null) return NotFound();

    blueCard.VesselId = dto.VesselId;
    blueCard.IssuedDate = dto.IssuedDate;
    blueCard.ExpiryDate = dto.ExpiryDate;
    blueCard.DocumentUrl = dto.DocumentUrl;
    blueCard.Insurer = dto.Insurer;
    blueCard.LastUpdated = DateTime.UtcNow;

    await _context.SaveChangesAsync();
    return NoContent();
}


    
    [HttpDelete("{id}")] //This endpoint deletes an existing bluecard record based on ID.
    public async Task<IActionResult> DeleteBlueCard(int id)
    {
        var blueCard = await _context.BlueCards.FindAsync(id);
        if (blueCard == null) return NotFound();
        _context.BlueCards.Remove(blueCard);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}