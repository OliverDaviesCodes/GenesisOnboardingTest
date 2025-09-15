using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DataEntriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public DataEntriesController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim ?? "0");
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DataEntryDto>>> GetDataEntries()
        {
            var userId = GetCurrentUserId();
            
            var entries = await _context.DataEntries
                .Where(d => d.UserId == userId)
                .Select(d => new DataEntryDto
                {
                    Id = d.Id,
                    Title = d.Title,
                    Description = d.Description,
                    Category = d.Category,
                    Value = d.Value,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt,
                    UserId = d.UserId
                })
                .ToListAsync();
                
            return Ok(entries);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<DataEntryDto>> GetDataEntry(int id)
        {
            var userId = GetCurrentUserId();
            
            var entry = await _context.DataEntries
                .Where(d => d.Id == id && d.UserId == userId)
                .Select(d => new DataEntryDto
                {
                    Id = d.Id,
                    Title = d.Title,
                    Description = d.Description,
                    Category = d.Category,
                    Value = d.Value,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt,
                    UserId = d.UserId
                })
                .FirstOrDefaultAsync();
                
            if (entry == null)
            {
                return NotFound();
            }
            
            return Ok(entry);
        }
        
        [HttpPost]
        public async Task<ActionResult<DataEntryDto>> CreateDataEntry([FromBody] CreateDataEntryDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var userId = GetCurrentUserId();
            
            var entry = new DataEntry
            {
                Title = createDto.Title,
                Description = createDto.Description,
                Category = createDto.Category,
                Value = createDto.Value,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            _context.DataEntries.Add(entry);
            await _context.SaveChangesAsync();
            
            var result = new DataEntryDto
            {
                Id = entry.Id,
                Title = entry.Title,
                Description = entry.Description,
                Category = entry.Category,
                Value = entry.Value,
                CreatedAt = entry.CreatedAt,
                UpdatedAt = entry.UpdatedAt,
                UserId = entry.UserId
            };
            
            return CreatedAtAction(nameof(GetDataEntry), new { id = entry.Id }, result);
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDataEntry(int id, [FromBody] UpdateDataEntryDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var userId = GetCurrentUserId();
            
            var entry = await _context.DataEntries
                .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);
                
            if (entry == null)
            {
                return NotFound();
            }
            
            entry.Title = updateDto.Title;
            entry.Description = updateDto.Description;
            entry.Category = updateDto.Category;
            entry.Value = updateDto.Value;
            entry.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDataEntry(int id)
        {
            var userId = GetCurrentUserId();
            
            var entry = await _context.DataEntries
                .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);
                
            if (entry == null)
            {
                return NotFound();
            }
            
            _context.DataEntries.Remove(entry);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
    }
}