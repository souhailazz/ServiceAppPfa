using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Utilisateurs> UtilisateurDB { get; set; }
        public DbSet<Professionnels> ProfessionnelDB { get; set; }
        public DbSet<Clients> ClientDB { get; set; }
        public DbSet<Demandes> DemandeDB { get; set; }
        public DbSet<Photos> PhotoDB { get; set; }
        public DbSet<Commentaires> CommentaireDB { get; set; }
        public DbSet<Evaluations> EvaluationDB { get; set; }
        public DbSet<Chatbot> ChatbotDB { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                IConfigurationRoot configuration = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json")
                    .Build();
                
                string connectionString = configuration.GetConnectionString("DefaultConnection");
                optionsBuilder.UseSqlServer(connectionString);
            }
        }
    }
}
