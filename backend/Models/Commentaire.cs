using backend.Models;
namespace backend.Models;

public class Commentaires
{
    public int Id { get; set; } // Clé primaire
    public int DemandeId { get; set; } // Clé étrangère vers Demandes
    public int UtilisateurId { get; set; } // Clé étrangère vers Utilisateurs
    public string Contenu { get; set; }
    public DateTime DateCommentaire { get; set; } = DateTime.Now;

    // Relations
    public Demandes Demande { get; set; }
    public Utilisateurs Utilisateur { get; set; }
}