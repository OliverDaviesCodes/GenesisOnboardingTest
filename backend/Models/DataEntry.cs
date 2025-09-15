using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class DataEntry
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public string Category { get; set; } = string.Empty;
        
        [Range(0, double.MaxValue)]
        public decimal Value { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        public int UserId { get; set; }
        
        public User User { get; set; } = null!;
    }
}