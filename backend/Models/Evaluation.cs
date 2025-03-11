using backend.Models;
namespace backend.Models;

public class Evaluations
{
    public int Id { get; set; } // Clé primaire
    public int ProfessionnelId { get; set; } // Clé étrangère vers Professionnels
    public int ClientId { get; set; } // Clé étrangère vers Clients
    public int Note { get; set; }
    public string? Commentaire { get; set; }
    public DateTime DateEvaluation { get; set; } = DateTime.Now;

    // Relations
    public Professionnels Professionnel { get; set; }
    public Clients Client { get; set; }
}