using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Utilisateur> Utilisateurs { get; set; }
        public DbSet<Professionnel> Professionnels { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Demande> Demandes { get; set; }
        public DbSet<Photo> Photos { get; set; }
        public DbSet<Commentaire> Commentaires { get; set; }
        public DbSet<Evaluation> Evaluations { get; set; }
        public DbSet<Chatbot> Chatbots { get; set; }

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
