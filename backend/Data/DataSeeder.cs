using backend.Models;

namespace backend.Data
{
    public static class DataSeeder
    {
        public static void Seed(ApplicationDbContext db)
        {
            // Seed only once
            if (db.Users.Any()) return;

            // 1) Create a demo user
            var user = new User
            {
                FirstName = "Demo",
                LastName = "User",
                Email = "demo@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password!123")
            };
            db.Users.Add(user);
            db.SaveChanges();

            // 2) Create some demo data entries for that user
            var now = DateTime.UtcNow;
            db.DataEntries.AddRange(
                new DataEntry
                {
                    Title = "Sample A",
                    Description = "Seeded item A",
                    Category = "General",
                    Value = 10,
                    UserId = user.Id,
                    // Remove these if your model sets them automatically
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new DataEntry
                {
                    Title = "Sample B",
                    Description = "Seeded item B",
                    Category = "General",
                    Value = 25,
                    UserId = user.Id,
                    CreatedAt = now,
                    UpdatedAt = now
                }
            );
            db.SaveChanges();
        }
    }
}