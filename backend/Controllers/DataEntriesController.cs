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
        
        // Personal entries (CRUD)
        [HttpGet]
        public async Task<IActionResult> GetPersonal()
        {
            var userId = GetCurrentUserId();
            var entries = await _context.DataEntries
                .Include(e => e.User)
                .Where(e => e.UserId == userId) // <-- This line is critical!
                .ToListAsync();

            var result = entries.Select(e => new DataEntryDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                Category = e.Category,
                Value = e.Value,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt,
                UserId = e.UserId,
                CreatedBy = e.User != null ? $"{e.User.FirstName} {e.User.LastName}" : "Unknown"
            }).ToList();

            return Ok(result);
        }
        
        // All entries (Read-only)
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var entries = await _context.DataEntries
                .Include(e => e.User) // Make sure User navigation property is included
                .ToListAsync();

            var dtos = entries.Select(e => new DataEntryDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                Category = e.Category,
                Value = e.Value,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt,
                UserId = e.UserId,
                CreatedBy = e.User != null ? $"{e.User.FirstName} {e.User.LastName}" : "Unknown"
            }).ToList();

            return Ok(dtos);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<DataEntryDto>> GetDataEntry(int id)
        {
            var userId = GetCurrentUserId();

            var entry = await _context.DataEntries
                .Include(d => d.User)
                .Where(d => d.Id == id && d.UserId == userId)
                .FirstOrDefaultAsync();

            if (entry == null)
            {
                return NotFound();
            }

            var result = new DataEntryDto
            {
                Id = entry.Id,
                Title = entry.Title,
                Description = entry.Description,
                Category = entry.Category,
                Value = entry.Value,
                CreatedAt = entry.CreatedAt,
                UpdatedAt = entry.UpdatedAt,
                UserId = entry.UserId,
                CreatedBy = entry.User != null ? $"{entry.User.FirstName} {entry.User.LastName}" : "Unknown"
            };

            return Ok(result);
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

            // Fetch the user for CreatedBy
            var user = await _context.Users.FindAsync(userId);

            var result = new DataEntryDto
            {
                Id = entry.Id,
                Title = entry.Title,
                Description = entry.Description,
                Category = entry.Category,
                Value = entry.Value,
                CreatedAt = entry.CreatedAt,
                UpdatedAt = entry.UpdatedAt,
                UserId = entry.UserId,
                CreatedBy = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown"
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
                .Include(d => d.User) // <-- Include User for CreatedBy
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

            // Return the updated entry with CreatedBy
            var result = new DataEntryDto
            {
                Id = entry.Id,
                Title = entry.Title,
                Description = entry.Description,
                Category = entry.Category,
                Value = entry.Value,
                CreatedAt = entry.CreatedAt,
                UpdatedAt = entry.UpdatedAt,
                UserId = entry.UserId,
                CreatedBy = entry.User != null ? $"{entry.User.FirstName} {entry.User.LastName}" : "Unknown"
            };

            return Ok(result);
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