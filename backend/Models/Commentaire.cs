public class Commentaire
{
    public int Id { get; set; } // Clé primaire
    public int DemandeId { get; set; } // Clé étrangère vers Demandes
    public int UtilisateurId { get; set; } // Clé étrangère vers Utilisateurs
    public string Contenu { get; set; }
    public DateTime DateCommentaire { get; set; } = DateTime.Now;

    // Relations
    public Demande Demande { get; set; }
    public Utilisateur Utilisateur { get; set; }
}