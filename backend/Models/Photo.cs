using backend.Models;
namespace backend.Models;

public class Photos
{
    public int Id { get; set; } // Clé primaire
    public string Url { get; set; }
    public int? ProfessionnelId { get; set; } // Clé étrangère vers Professionnels (nullable)
    public int? DemandeId { get; set; } // Clé étrangère vers Demandes (nullable)

    // Relations
    public Professionnels? Professionnel { get; set; }
    public Demandes? Demande { get; set; }
}