using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class DataEntryDto
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public string Category { get; set; } = string.Empty;
        
        [Range(0, double.MaxValue)]
        public decimal Value { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int UserId { get; set; }
    }
    
    public class CreateDataEntryDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public string Category { get; set; } = string.Empty;
        
        [Range(0, double.MaxValue)]
        public decimal Value { get; set; }
    }
    
    public class UpdateDataEntryDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public string Category { get; set; } = string.Empty;
        
        [Range(0, double.MaxValue)]
        public decimal Value { get; set; }
    }
}